import { getCurrentUser } from "@/app/actions/auth";
import { prisma } from "@/lib/prisma";
import RosterClient from "./RosterClient";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ClassRosterPage() {
  const user = await getCurrentUser();
  
  if (!user || user.role !== "LECTURER") {
    redirect("/login");
  }

  // Find all student users
  const students = await prisma.user.findMany({
    where: { role: "STUDENT" },
    include: {
      submissions: true
    },
    orderBy: { name: "asc" }
  });

  // Serialize properties for client handover
  const serializedStudents = students.map(student => ({
    id: student.id,
    name: student.name,
    email: student.email,
    matricNo: student.matricNo || "N/A",
    level: student.level || "N/A",
    department: student.department || "N/A",
    submissionsCount: student.submissions.length,
  }));

  return <RosterClient students={serializedStudents} />;
}