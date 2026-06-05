import { getCurrentUser } from "@/app/actions/auth";
import { prisma } from "@/lib/prisma";
import StudentDashboardClient from "./StudentDashboardClient";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function StudentDashboardPage() {
  const user = await getCurrentUser();
  
  if (!user || user.role !== "STUDENT") {
    redirect("/login");
  }

  // Fetch all submissions for this student from DB
  const submissions = await prisma.submission.findMany({
    where: { studentId: user.id },
    orderBy: { createdAt: "desc" }
  });

  // Calculate metrics dynamically
  const metrics = {
    total: submissions.length,
    pending: submissions.filter(s => s.status !== "graded").length,
    graded: submissions.filter(s => s.status === "graded").length,
  };

  // Convert dates and Prisma objects to plain JS objects for client components
  const serializedSubmissions = submissions.map(sub => ({
    id: sub.id,
    docTitle: sub.docTitle,
    filePath: sub.filePath,
    fileSize: sub.fileSize,
    type: sub.type,
    status: sub.status,
    aiScore: sub.aiScore,
    humanScore: sub.humanScore,
    createdAt: sub.createdAt.toISOString(),
  }));

  return (
    <StudentDashboardClient 
      user={user} 
      submissions={serializedSubmissions} 
      metrics={metrics} 
    />
  );
}