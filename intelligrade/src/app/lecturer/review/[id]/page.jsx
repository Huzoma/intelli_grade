import { getCurrentUser } from "@/app/actions/auth";
import { prisma } from "@/lib/prisma";
import ReviewWorkspaceClient from "./ReviewWorkspaceClient";
import { redirect, notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ReviewWorkspacePage({ params }) {
  const user = await getCurrentUser();
  
  if (!user || user.role !== "LECTURER") {
    redirect("/login");
  }

  const { id } = await params;

  if (!id) {
    notFound();
  }

  // Fetch the submission along with student, rubric, and viva questions
  const submission = await prisma.submission.findUnique({
    where: { id: id },
    include: {
      student: true,
      rubric: true,
      vivaQuestions: true
    }
  });

  if (!submission) {
    notFound();
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
    date: submission.createdAt.toISOString(),
  };

  const serializedVivaQuestions = submission.vivaQuestions.map(q => ({
    id: q.id,
    text: q.text,
    added: q.added,
  }));

  return (
    <ReviewWorkspaceClient
      submission={serializedSubmission}
      vivaQuestions={serializedVivaQuestions}
      rubricCriteria={criteriaList}
    />
  );
}