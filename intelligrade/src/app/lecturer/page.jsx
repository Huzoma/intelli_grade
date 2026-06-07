import { getCurrentUser } from "@/app/actions/auth";
import { prisma } from "@/lib/prisma";
import LecturerDashboardClient from "./LecturerDashboardClient";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function LecturerDashboardPage() {
  const user = await getCurrentUser();
  
  if (!user || user.role !== "LECTURER") {
    redirect("/api/auth/logout");
  }

  // Fetch all submissions in the system with associated student profiles
  const submissions = await prisma.submission.findMany({
    include: {
      student: true
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  // Calculate metrics dynamically
  const metrics = {
    total: submissions.length,
    processing: submissions.filter(s => s.status === "processing").length,
    needsGrading: submissions.filter(s => s.status === "needs_grading").length,
    graded: submissions.filter(s => s.status === "graded").length,
  };

  // Serialize objects for transition to client components
  const serializedSubmissions = submissions.map(sub => ({
    id: sub.id,
    docTitle: sub.docTitle,
    studentName: sub.student?.name || "Unknown Student",
    matricNo: sub.student?.matricNo || "N/A",
    type: sub.type,
    status: sub.status,
    aiScore: sub.aiScore || 0,
    humanScore: sub.humanScore || null,
    createdAt: sub.createdAt.toISOString(),
  }));

  return (
    <LecturerDashboardClient 
      user={user} 
      submissions={serializedSubmissions} 
      metrics={metrics} 
    />
  );
}