import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { getCurrentUser } from "@/app/actions/auth";

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

    // 3. Convert file buffer and save to local public uploads
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    const fileExt = path.extname(file.name) || ".pdf";
    const filename = `${crypto.randomUUID()}${fileExt}`;
    const filePath = path.join(uploadsDir, filename);
    await writeFile(filePath, buffer);

    const dbFilePath = `/uploads/${filename}`;

    // 4. Match Rubric dynamically
    let rubricTitle = "Standard SIWES IT Report";
    if (type === "project_proposal") {
      rubricTitle = "Final Year Project Proposal";
    } else if (type === "assignment") {
      rubricTitle = "Database Architecture Assignment";
    }

    const rubric = await prisma.rubric.findFirst({
      where: { title: rubricTitle }
    });

    // 5. Match default Lecturer
    const lecturer = await prisma.user.findFirst({
      where: { role: "LECTURER" }
    });

    // Helper to format file size
    const formatBytes = (bytesVal) => {
      if (bytesVal === 0) return "0 Bytes";
      const k = 1024;
      const sizes = ["Bytes", "KB", "MB", "GB"];
      const i = Math.floor(Math.log(bytesVal) / Math.log(k));
      return parseFloat((bytesVal / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    // 6. Create Submission record in database
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
      }
    });

    return NextResponse.json({ success: true, submissionId: submission.id });
  } catch (error) {
    console.error("Upload API error:", error);
    return NextResponse.json({ error: "Upload failed: " + error.message }, { status: 500 });
  }
}
