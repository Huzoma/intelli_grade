import { getCurrentUser } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import LecturerSettingsClient from "./LecturerSettingsClient";

export const dynamic = "force-dynamic";

export default async function LecturerSettingsPage() {
  const user = await getCurrentUser();
  
  if (!user || user.role !== "LECTURER") {
    redirect("/api/auth/logout");
  }

  return <LecturerSettingsClient user={user} />;
}