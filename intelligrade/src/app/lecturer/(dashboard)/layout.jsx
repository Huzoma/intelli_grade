"use client";

import Sidebar from "@/components/Sidebar";
import { LayoutDashboard, ListChecks, Users, Settings } from "lucide-react";

export default function DashboardLayout({ children }) {
  const navigation = [
    { name: "Submission Queue", href: "/lecturer", icon: LayoutDashboard },
    { name: "Rubric Manager", href: "/lecturer/rubrics", icon: ListChecks },
    { name: "Class Roster", href: "/lecturer/roster", icon: Users },
    { name: "Settings", href: "/lecturer/settings", icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 overflow-hidden relative">
      <Sidebar role="LECTURER" navigation={navigation} />
      <main className="flex-1 overflow-y-auto w-full pt-16 md:pt-0">
        <div className="h-full w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
