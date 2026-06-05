"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createRubricAction(title, criteriaCount, criteriaList) {
  try {
    const listString = JSON.stringify(criteriaList);
    const newRubric = await prisma.rubric.create({
      data: {
        title,
        criteriaCount: parseInt(criteriaCount),
        criteriaList: listString,
      }
    });

    revalidatePath("/lecturer/rubrics");
    return { success: true, rubric: newRubric };
  } catch (error) {
    console.error("Error creating rubric:", error);
    return { error: "Failed to create rubric: " + error.message };
  }
}

export async function updateRubricAction(id, title, criteriaCount, criteriaList) {
  try {
    const listString = JSON.stringify(criteriaList);
    const updated = await prisma.rubric.update({
      where: { id: parseInt(id) },
      data: {
        title,
        criteriaCount: parseInt(criteriaCount),
        criteriaList: listString,
        lastUpdated: new Date()
      }
    });

    revalidatePath("/lecturer/rubrics");
    return { success: true, rubric: updated };
  } catch (error) {
    console.error("Error updating rubric:", error);
    return { error: "Failed to update rubric: " + error.message };
  }
}
