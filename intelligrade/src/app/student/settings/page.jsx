import { getCurrentUser } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import StudentSettingsClient from "./StudentSettingsClient";

export const dynamic = "force-dynamic";

export default async function StudentSettingsPage() {
  const user = await getCurrentUser();
  
  if (!user || user.role !== "STUDENT") {
    redirect("/login");
  }

  return <StudentSettingsClient user={user} />;
}