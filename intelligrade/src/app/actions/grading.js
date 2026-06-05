"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Action to toggle whether a viva question is added to the student's grading sheet
export async function toggleVivaQuestionAction(questionId, added) {
  try {
    const updated = await prisma.vivaQuestion.update({
      where: { id: questionId },
      data: { added }
    });
    
    revalidatePath("/lecturer/review/[id]", "page");
    return { success: true, updated };
  } catch (error) {
    console.error("Error toggling viva question:", error);
    return { error: "Failed to update question: " + error.message };
  }
}

// Action to save draft or finalize a grade
export async function submitGradeAction(submissionId, humanScore, status = "graded") {
  try {
    const updated = await prisma.submission.update({
      where: { id: submissionId },
      data: {
        humanScore: parseInt(humanScore),
        status: status // 'needs_grading' or 'graded'
      }
    });

    revalidatePath("/lecturer");
    revalidatePath(`/lecturer/review/${submissionId}`);
    return { success: true, updated };
  } catch (error) {
    console.error("Error saving grade:", error);
    return { error: "Failed to submit grade: " + error.message };
  }
}
