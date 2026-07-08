"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, BookOpen, ArrowLeft, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { loginAction } from "@/app/actions/auth";

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState("student"); // 'student' | 'lecturer'
  const [email, setEmail] = useState("uzoma@university.edu");
  const [password, setPassword] = useState("password");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Sync demo credentials when switching roles via user interaction click
  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setError(null);
    if (newRole === "student") {
      setEmail("uzoma@university.edu");
    } else {
      setEmail("eric@university.edu");
    }
    setPassword("password");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await loginAction(email, password, role.toUpperCase());
      if (res.error) {
        setError(res.error);
        setIsLoading(false);
      } else {
        // Redirect client-side to trigger fresh navigation
        if (res.role === "STUDENT") {
          router.push("/student");
        } else {
          router.push("/lecturer");
        }
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-6 lg:px-8 relative bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 overflow-hidden">
      {/* Floating Theme Toggle */}
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>

      {/* Subtle Background Grid */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px]"></div>

      {/* Ambient background glows */}
      <div className="absolute top-1/4 right-[-10%] w-[350px] h-[350px] rounded-full bg-indigo-500/10 blur-[100px] -z-10 pointer-events-none"></div>
      <div className="absolute bottom-1/4 left-[-10%] w-[350px] h-[350px] rounded-full bg-violet-500/10 blur-[100px] -z-10 pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 90, damping: 14 }}
        className="sm:mx-auto sm:w-full sm:max-w-md"
      >
        <Link 
          href="/" 
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-primary transition-colors mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-0.5 transition-transform" />
          Back to Home
        </Link>
        <h2 className="text-3xl font-heading font-extrabold text-slate-900 dark:text-white tracking-tight">
          Welcome back
        </h2>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 font-semibold">
          Sign in to access the IntelliGrade portal (seeded accounts loaded)
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 90, damping: 14, delay: 0.1 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
      >
        <div className="glass-panel py-8 px-6 shadow-sm rounded-2xl sm:px-10">
          
          {/* Role Toggle with sliding background capsule */}
          <div className="flex p-1 mb-8 bg-slate-100 dark:bg-slate-950/80 rounded-xl relative overflow-hidden border border-slate-200/40 dark:border-slate-800/40">
            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleRoleChange("student")}
              className={`flex-1 flex items-center justify-center py-2.5 text-xs font-semibold rounded-lg transition-colors duration-200 z-10 cursor-pointer disabled:opacity-50 ${
                role === "student"
                  ? "text-primary font-bold"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-205"
              }`}
            >
              <GraduationCap className="w-4 h-4 mr-2" />
              Student
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleRoleChange("lecturer")}
              className={`flex-1 flex items-center justify-center py-2.5 text-xs font-semibold rounded-lg transition-colors duration-200 z-10 cursor-pointer disabled:opacity-50 ${
                role === "lecturer"
                  ? "text-primary font-bold"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-205"
              }`}
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Lecturer
            </button>

            {/* Sliding backdrop */}
            <motion.div
              className="absolute top-1 bottom-1 bg-white dark:bg-slate-900 shadow-sm rounded-lg border border-slate-200/50 dark:border-slate-800/40"
              initial={false}
              animate={{
                left: role === "student" ? "4px" : "50%",
                right: role === "student" ? "50%" : "4px",
              }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            />
          </div>

          {/* Error Banner */}
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-4 bg-danger-bg border border-danger-border rounded-xl flex items-start text-danger"
              >
                <AlertCircle className="w-5 h-5 mr-2 shrink-0 mt-0.5" />
                <span className="text-xs font-semibold">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Login Form */}
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Email address
              </label>
              <div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  disabled={isLoading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@university.edu"
                  className="appearance-none block w-full px-4 py-3 border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-border focus:border-primary text-sm transition-all duration-200 disabled:opacity-50"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  disabled={isLoading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="appearance-none block w-full px-4 py-3 border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-border focus:border-primary text-sm transition-all duration-200 disabled:opacity-50"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-primary border-slate-300 dark:border-slate-800 rounded bg-white dark:bg-slate-955"
                />
                <label htmlFor="remember-me" className="ml-2 block text-xs text-slate-600 dark:text-slate-400 font-semibold">
                  Remember me
                </label>
              </div>

              <div className="text-xs">
                <a href="#" className="font-semibold text-primary hover:text-primary-hover transition-colors">
                  Forgot password?
                </a>
              </div>
            </div>

            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-xs font-bold text-white bg-primary hover:bg-primary-hover transition-all duration-200 cursor-pointer group disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in to Dashboard
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
            </motion.div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}