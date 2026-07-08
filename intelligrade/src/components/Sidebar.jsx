"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, Menu, X, RefreshCw, GraduationCap, BookOpen } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { toggleDemoUserAction } from "@/app/actions/auth";

export default function Sidebar({ role, navigation }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleDemoToggle = async () => {
    const res = await toggleDemoUserAction();
    if (res.success) {
      window.location.href = res.role === "STUDENT" ? "/student" : "/lecturer";
    }
  };

  const isStudent = role === "STUDENT";
  const LogoIcon = isStudent ? GraduationCap : BookOpen;
  const logoText = "IntelliGrade";
  const roleBadge = isStudent ? "Student" : "Educator";

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 z-40 transition-colors">
        <div className="flex items-center">
          <LogoIcon className="w-5.5 h-5.5 text-primary mr-2.5" />
          <span className="text-base font-heading font-bold text-slate-900 dark:text-white tracking-tight">{logoText}</span>
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

            {/* Slide-in Mobile Drawer */}
            <motion.aside 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
              className="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 flex flex-col justify-between border-r border-slate-200 dark:border-slate-800 md:hidden transition-colors"
            >
              <div>
                {/* Logo Area */}
                <div className="h-16 flex items-center px-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
                  <LogoIcon className="w-6 h-6 text-primary mr-2" />
                  <span className="text-lg font-heading font-bold text-slate-900 dark:text-white tracking-tight">{logoText}</span>
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
                            ? "bg-primary-light text-primary shadow-sm border border-primary-border"
                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-slate-200"
                        }`}
                      >
                        <item.icon className={`w-5 h-5 mr-3 ${isActive ? "text-primary" : "text-slate-400 dark:text-slate-500"}`} />
                        {item.name}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* Theme Toggle & Switch Role / Logout */}
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/10 flex flex-col gap-3">
                <div className="flex items-center justify-between px-3 py-1.5 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Theme</span>
                  <ThemeToggle />
                </div>
                
                <button
                  onClick={handleDemoToggle}
                  className="flex items-center px-3 py-2.5 rounded-xl text-sm font-semibold text-primary hover:bg-primary-light transition-all duration-200 group cursor-pointer"
                >
                  <RefreshCw className="w-5 h-5 mr-3 text-primary group-hover:rotate-180 transition-transform duration-500" />
                  Switch to {isStudent ? "Lecturer" : "Student"}
                </button>

                <Link
                  href="/"
                  onClick={closeMobileMenu}
                  className="flex items-center px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-danger-bg hover:text-danger dark:hover:bg-danger-bg dark:hover:text-danger transition-all duration-200 group"
                >
                  <LogOut className="w-5 h-5 mr-3 text-slate-400 dark:text-slate-500 group-hover:text-danger transition-colors" />
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
          <div className="h-16 flex items-center px-6 border-b border-slate-100 dark:border-slate-800">
            <LogoIcon className="w-6 h-6 text-primary mr-2" />
            <span className="text-lg font-heading font-bold text-slate-900 dark:text-white tracking-tight">{logoText}</span>
            <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary-light text-primary border border-primary-border uppercase tracking-wider select-none">
              {roleBadge}
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <motion.div key={item.name} whileHover={{ x: 2 }} transition={{ type: "spring", stiffness: 400, damping: 20 }}>
                  <Link
                    href={item.href}
                    className={`flex items-center px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 border relative group ${
                      isActive
                        ? "bg-primary-light text-primary border-primary-border"
                        : "border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-slate-200"
                    }`}
                  >
                    <item.icon className={`w-5 h-5 mr-3 transition-colors duration-200 ${isActive ? "text-primary" : "text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300"}`} />
                    {item.name}
                  </Link>
                </motion.div>
              );
            })}
          </nav>
        </div>

        {/* Logout & Theme Toggle Pinned to Bottom */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-3">
          <div className="flex items-center justify-between px-3 py-1.5 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-150 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Theme</span>
            <ThemeToggle />
          </div>
          
          <button
            onClick={handleDemoToggle}
            className="flex items-center px-3.5 py-2.5 rounded-xl text-sm font-semibold text-primary hover:bg-primary-light border border-transparent hover:border-primary-border transition-all duration-200 group cursor-pointer"
          >
            <RefreshCw className="w-5 h-5 mr-3 text-primary group-hover:rotate-180 transition-transform duration-500" />
            Switch Role (Demo)
          </button>

          <Link
            href="/"
            className="flex items-center px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-danger-bg hover:text-danger dark:hover:bg-danger-bg dark:hover:text-danger border border-transparent hover:border-danger-border transition-all duration-200 group"
          >
            <LogOut className="w-5 h-5 mr-3 text-slate-400 dark:text-slate-500 group-hover:text-danger transition-colors" />
            Sign Out
          </Link>
        </div>
      </aside>
    </>
  );
}
