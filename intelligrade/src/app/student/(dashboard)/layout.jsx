"use client";

import Sidebar from "@/components/Sidebar";
import { LayoutDashboard, FileUp, Settings } from "lucide-react";

export default function DashboardLayout({ children }) {
  const navigation = [
    { name: "Overview", href: "/student", icon: LayoutDashboard },
    { name: "Submit Report", href: "/student/upload", icon: FileUp },
    { name: "Settings", href: "/student/settings", icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-background text-foreground transition-colors duration-300 overflow-hidden relative">
      <Sidebar role="STUDENT" navigation={navigation} />
      <main className="flex-1 overflow-y-auto w-full pt-16 md:pt-0">
        <div className="h-full w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
