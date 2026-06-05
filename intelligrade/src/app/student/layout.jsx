"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, FileUp, Settings, LogOut, GraduationCap, Menu, X, RefreshCw } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { toggleDemoUserAction } from "@/app/actions/auth";

export default function StudentLayout({ children }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { name: "Overview", href: "/student", icon: LayoutDashboard },
    { name: "Submit Report", href: "/student/upload", icon: FileUp },
    { name: "Settings", href: "/student/settings", icon: Settings },
  ];

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleDemoToggle = async () => {
    const res = await toggleDemoUserAction();
    if (res.success) {
      window.location.href = res.role === "STUDENT" ? "/student" : "/lecturer";
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 overflow-hidden relative">
      
      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 border-b border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between px-4 z-40">
        <div className="flex items-center">
          <GraduationCap className="w-5.5 h-5.5 text-blue-600 dark:text-blue-400 mr-2.5" />
          <span className="text-base font-bold text-slate-900 dark:text-white tracking-tight">IntelliGrade</span>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
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

            {/* Slide-in Mobile Menu */}
            <motion.aside 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
              className="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 flex flex-col justify-between border-r border-slate-200/50 dark:border-slate-800/50 md:hidden"
            >
              <div>
                {/* Logo Area */}
                <div className="h-16 flex items-center px-6 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-950/20">
                  <GraduationCap className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-2" />
                  <span className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">IntelliGrade</span>
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
                        className={`flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                          isActive
                            ? "bg-blue-50 dark:bg-blue-950/45 text-blue-600 dark:text-blue-450 shadow-sm border border-blue-100/50 dark:border-blue-900/30"
                            : "text-slate-655 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-slate-200"
                        }`}
                      >
                        <item.icon className={`w-5 h-5 mr-3 ${isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-500"}`} />
                        {item.name}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* Theme Toggle & Sign out */}
              <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/30 dark:bg-slate-950/10 flex flex-col gap-3">
                <div className="flex items-center justify-between px-3 py-1.5 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-100 dark:border-slate-800/50">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Theme</span>
                  <ThemeToggle />
                </div>
                
                <button
                  onClick={handleDemoToggle}
                  className="flex items-center px-3 py-2.5 rounded-xl text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 hover:text-indigo-750 transition-all duration-200 group cursor-pointer"
                >
                  <RefreshCw className="w-5 h-5 mr-3 text-indigo-500 group-hover:rotate-180 transition-transform duration-500" />
                  Switch to Lecturer
                </button>

                <Link
                  href="/"
                  onClick={closeMobileMenu}
                  className="flex items-center px-3 py-2.5 rounded-xl text-sm font-medium text-slate-655 dark:text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-600 dark:hover:text-rose-400 transition-all duration-200 group"
                >
                  <LogOut className="w-5 h-5 mr-3 text-slate-400 dark:text-slate-500 group-hover:text-rose-600 transition-colors" />
                  Sign Out
                </Link>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Fixed Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex-shrink-0 flex flex-col justify-between hidden md:flex z-10 shadow-sm transition-colors">
        <div>
          {/* Logo Area */}
          <div className="h-16 flex items-center px-6 border-b border-slate-100 dark:border-slate-800/60">
            <GraduationCap className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-2" />
            <span className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">IntelliGrade</span>
            <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              Student
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
                        ? "bg-blue-550/10 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/10"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-slate-200"
                    }`}
                  >
                    <item.icon className={`w-5 h-5 mr-3 transition-colors duration-200 ${isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-550 group-hover:text-slate-700 dark:group-hover:text-slate-300"}`} />
                    {item.name}
                  </Link>
                </motion.div>
              );
            })}
          </nav>
        </div>

        {/* Logout & Theme Toggle Pinned to Bottom */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-3">
          <div className="flex items-center justify-between px-3 py-1.5 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-150/80 dark:border-slate-800/50">
            <span className="text-xs font-semibold text-slate-550 dark:text-slate-400">Theme</span>
            <ThemeToggle />
          </div>
          
          <button
            onClick={handleDemoToggle}
            className="flex items-center px-3.5 py-2.5 rounded-xl text-sm font-semibold text-indigo-650 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 hover:text-indigo-850 transition-all duration-200 group cursor-pointer"
          >
            <RefreshCw className="w-5 h-5 mr-3 text-indigo-500 group-hover:rotate-180 transition-transform duration-500" />
            Switch to Lecturer (Demo)
          </button>

          <Link
            href="/"
            className="flex items-center px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-600 dark:hover:text-rose-400 transition-all duration-200 group"
          >
            <LogOut className="w-5 h-5 mr-3 text-slate-400 dark:text-slate-500 group-hover:text-rose-500 transition-colors" />
            Sign Out
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto w-full pt-16 md:pt-0">
        <div className="h-full w-full">
          {children}
        </div>
      </main>
    </div>
  );
}