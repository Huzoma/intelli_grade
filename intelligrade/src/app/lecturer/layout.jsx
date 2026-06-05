"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, ListChecks, Users, Settings, LogOut, BookOpen, Menu, X, RefreshCw } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { toggleDemoUserAction } from "@/app/actions/auth";

export default function LecturerLayout({ children }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { name: "Submission Queue", href: "/lecturer", icon: LayoutDashboard },
    { name: "Rubric Manager", href: "/lecturer/rubrics", icon: ListChecks },
    { name: "Class Roster", href: "/lecturer/roster", icon: Users },
    { name: "Settings", href: "/lecturer/settings", icon: Settings },
  ];

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleDemoToggle = async () => {
    const res = await toggleDemoUserAction();
    if (res.success) {
      window.location.href = res.role === "STUDENT" ? "/student" : "/lecturer";
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-350 overflow-hidden relative">
        
      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 border-b border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between px-4 z-40">
        <div className="flex items-center">
          <BookOpen className="w-5.5 h-5.5 text-indigo-600 dark:text-indigo-400 mr-2.5" />
          <span className="text-base font-bold text-slate-900 dark:text-white tracking-tight">IntelliGrade</span>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-slate-550 hover:text-slate-900 dark:text-slate-405 dark:hover:text-white transition-colors cursor-pointer"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Overlay & Sidebar Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMobileMenu}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden"
            />

            {/* Slide-in Mobile Drawer */}
            <motion.aside 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
              className="fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 flex flex-col justify-between border-r border-slate-800 md:hidden"
            >
              <div>
                {/* Logo Area */}
                <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-950">
                  <BookOpen className="w-6 h-6 text-indigo-450 mr-2" />
                  <span className="text-lg font-bold text-white tracking-tight">IntelliGrade</span>
                </div>

                {/* Navigation Links */}
                <nav className="p-4 space-y-1">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={closeMobileMenu}
                        className={`flex items-center px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                          isActive
                            ? "bg-indigo-500/15 text-indigo-400 shadow-sm border border-indigo-500/10"
                            : "text-slate-400 hover:bg-slate-800 hover:text-white"
                        }`}
                      >
                        <item.icon className={`w-5 h-5 mr-3 ${isActive ? "text-indigo-400" : "text-slate-500"}`} />
                        {item.name}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* Theme Toggle & Logout */}
              <div className="p-4 border-t border-slate-800 bg-slate-900 flex flex-col gap-3">
                <div className="flex items-center justify-between px-3 py-1.5 bg-slate-950/60 rounded-xl border border-slate-800/80">
                  <span className="text-xs font-semibold text-slate-400">Theme</span>
                  <ThemeToggle />
                </div>
                
                <button
                  onClick={handleDemoToggle}
                  className="flex items-center px-3 py-2.5 rounded-xl text-sm font-semibold text-indigo-400 hover:bg-slate-800 hover:text-white transition-all duration-200 group cursor-pointer"
                >
                  <RefreshCw className="w-5 h-5 mr-3 text-indigo-500 group-hover:rotate-180 transition-transform duration-500" />
                  Switch to Student
                </button>
                
                <Link
                  href="/"
                  onClick={closeMobileMenu}
                  className="flex items-center px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-all duration-200 group"
                >
                  <LogOut className="w-5 h-5 mr-3 text-slate-550 group-hover:text-rose-455 transition-colors" />
                  Sign Out
                </Link>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Fixed Sidebar */}
      <aside className="w-64 bg-slate-900 flex flex-col justify-between border-r border-slate-800/80 hidden md:flex z-10 shadow-md">
        <div>
          {/* Logo Area */}
          <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-950">
            <BookOpen className="w-6 h-6 text-indigo-400 mr-2" />
            <span className="text-lg font-bold text-white tracking-tight">IntelliGrade</span>
            <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 uppercase tracking-wider">
              Educator
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <motion.div key={item.name} whileHover={{ x: 3 }} transition={{ type: "spring", stiffness: 400, damping: 20 }}>
                  <Link
                    href={item.href}
                    className={`flex items-center px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 relative group ${
                      isActive
                        ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/10 shadow-sm"
                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <item.icon className={`w-5 h-5 mr-3 transition-colors duration-200 ${isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"}`} />
                    {item.name}
                  </Link>
                </motion.div>
              );
            })}
          </nav>
        </div>

        {/* Theme Toggle & Logout Button */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 flex flex-col gap-3">
          <div className="flex items-center justify-between px-3 py-1.5 bg-slate-950/60 rounded-xl border border-slate-800/80">
            <span className="text-xs font-semibold text-slate-400">Theme</span>
            <ThemeToggle />
          </div>
          
          <button
            onClick={handleDemoToggle}
            className="flex items-center px-3.5 py-2.5 rounded-xl text-sm font-semibold text-indigo-400 hover:bg-slate-800 hover:text-white transition-all duration-200 group cursor-pointer"
          >
            <RefreshCw className="w-5 h-5 mr-3 text-indigo-400 group-hover:rotate-180 transition-transform duration-500" />
            Switch to Student (Demo)
          </button>

          <Link
            href="/"
            className="flex items-center px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-all duration-200 group"
          >
            <LogOut className="w-5 h-5 mr-3 text-slate-500 group-hover:text-rose-400 transition-colors" />
            Sign Out
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto w-full pt-16 md:pt-0">
        <div className="h-full w-full bg-slate-50 dark:bg-slate-950 transition-colors duration-350">
          {children}
        </div>
      </main>
    </div>
  );
}