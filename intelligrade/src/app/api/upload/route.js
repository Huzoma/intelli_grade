import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import path from "path";
import { getCurrentUser } from "@/app/actions/auth";

// Initialize Supabase client with the Service Role Key to bypass RLS for uploads
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    // 1. Verify user session and student role
    const user = await getCurrentUser();
    if (!user || user.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse request formData
    const formData = await request.formData();
    const file = formData.get("file");
    const type = formData.get("type"); // 'it_report', 'project_proposal', 'assignment'

    if (!file || !type) {
      return NextResponse.json({ error: "Missing file or type" }, { status: 400 });
    }

    // 3. Convert file buffer and generate unique filename
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileExt = path.extname(file.name) || ".pdf";
    const filename = `${crypto.randomUUID()}${fileExt}`;

    // 4. Upload directly to Supabase Storage bucket
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("documents")
      .upload(filename, buffer, {
        contentType: "application/pdf",
        upsert: false,
      });

    if (uploadError) {
      throw new Error("Supabase Storage error: " + uploadError.message);
    }

    // 5. Retrieve the public URL
    const { data: publicUrlData } = supabase.storage
      .from("documents")
      .getPublicUrl(filename);

    const dbFilePath = publicUrlData.publicUrl;

    // 6. Match Rubric dynamically
    let rubricTitle = "Standard SIWES IT Report";
    if (type === "project_proposal") {
      rubricTitle = "Final Year Project Proposal";
    } else if (type === "assignment") {
      rubricTitle = "Database Architecture Assignment";
    }

    const rubric = await prisma.rubric.findFirst({
      where: { title: rubricTitle },
    });

    // 7. Match default Lecturer
    const lecturer = await prisma.user.findFirst({
      where: { role: "LECTURER" },
    });

    // Helper to format file size
    const formatBytes = (bytesVal) => {
      if (bytesVal === 0) return "0 Bytes";
      const k = 1024;
      const sizes = ["Bytes", "KB", "MB", "GB"];
      const i = Math.floor(Math.log(bytesVal) / Math.log(k));
      return parseFloat((bytesVal / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    // 8. Create Submission record in database
    const submission = await prisma.submission.create({
      data: {
        docTitle: file.name,
        filePath: dbFilePath,
        fileSize: formatBytes(file.size),
        type: type,
        status: "processing",
        studentId: user.id,
        lecturerId: lecturer?.id || null,
        rubricId: rubric?.id || null,
      },
    });

    return NextResponse.json({ success: true, submissionId: submission.id });
  } catch (error) {
    console.error("Upload API error:", error);
    return NextResponse.json({ error: "Upload failed: " + error.message }, { status: 500 });
  }
}