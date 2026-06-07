import { getCurrentUser } from "@/app/actions/auth";
import { prisma } from "@/lib/prisma";
import RubricManagerClient from "./RubricManagerClient";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function RubricManagerPage() {
  const user = await getCurrentUser();
  
  if (!user || user.role !== "LECTURER") {
    redirect("/api/auth/logout");
  }

  // Fetch all rubrics from database
  const rubrics = await prisma.rubric.findMany({
    orderBy: { id: "desc" }
  });

  // Serialize criteria lists and model dates
  const serializedRubrics = rubrics.map(r => {
    let criteriaList = [];
    try {
      criteriaList = JSON.parse(r.criteriaList);
    } catch (e) {
      console.error("Error parsing criteriaList in RubricManagerPage:", e);
    }
    
    return {
      id: r.id,
      title: r.title,
      criteriaCount: r.criteriaCount,
      criteriaList: criteriaList,
      lastUpdated: r.lastUpdated.toISOString()
    };
  });

  return <RubricManagerClient initialRubrics={serializedRubrics} />;
}