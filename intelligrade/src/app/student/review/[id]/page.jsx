import { getCurrentUser } from "@/app/actions/auth";
import { prisma } from "@/lib/prisma";
import StudentReviewClient from "./StudentReviewClient";
import { redirect, notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function StudentReviewWorkspacePage({ params }) {
  const user = await getCurrentUser();
  
  if (!user || user.role !== "STUDENT") {
    redirect("/api/auth/logout");
  }

  const { id } = await params;

  if (!id) {
    notFound();
  }

  // Fetch the submission along with student, rubric, and comments (NO VIVA QUESTIONS for students)
  const submission = await prisma.submission.findUnique({
    where: { id: id },
    include: {
      student: true,
      rubric: true,
      comments: {
        orderBy: { createdAt: "asc" }
      }
    }
  });

  if (!submission) {
    notFound();
  }

  // Security check: Only the owner of the submission can view their feedback
  if (submission.studentId !== user.id) {
    redirect("/student");
  }

  // Parse Rubric criteria from JSON list string
  let criteriaList = [];
  if (submission.rubric) {
    try {
      criteriaList = JSON.parse(submission.rubric.criteriaList);
    } catch (e) {
      console.error("Error parsing criteria list JSON:", e);
    }
  }

  // Serialize models for the client
  const serializedSubmission = {
    id: submission.id,
    docTitle: submission.docTitle,
    filePath: submission.filePath,
    fileSize: submission.fileSize,
    type: submission.type,
    status: submission.status,
    aiScore: submission.aiScore || 0,
    humanScore: submission.humanScore,
    studentName: submission.student?.name || "Unknown Student",
    matricNo: submission.student?.matricNo || "N/A",
    entities: submission.entities || "",
    summary: submission.summary || "",
    fullText: submission.fullText || "",
    date: submission.createdAt.toISOString(),
    comments: submission.comments.map(c => ({
      id: c.id,
      text: c.text,
      quote: c.quote,
      date: c.createdAt.toISOString()
    })),
  };

  return (
    <StudentReviewClient
      submission={serializedSubmission}
      rubricCriteria={criteriaList}
    />
  );
}
