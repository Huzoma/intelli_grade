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
      <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px]"></div>

      {/* Ambient background glows */}
      <div className="absolute top-1/4 right-[-10%] w-[350px] h-[350px] rounded-full bg-indigo-500/10 blur-[100px] -z-10 pointer-events-none"></div>
      <div className="absolute bottom-1/4 left-[-10%] w-[350px] h-[350px] rounded-full bg-violet-500/10 blur-[100px] -z-10 pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 90, damping: 14 }}
        className="sm:mx-auto sm:w-full sm:max-w-md"
      >
        <Link 
          href="/" 
          className="inline-flex items-center text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-indigo-655 dark:hover:text-indigo-400 transition-colors mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-0.5 transition-transform" />
          Back to Home
        </Link>
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Welcome back
        </h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Sign in to access the IntelliGrade portal (seeded accounts loaded)
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 90, damping: 14, delay: 0.1 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
      >
        <div className="glass-panel py-8 px-6 shadow-xl rounded-2xl sm:px-10">
          
          {/* Role Toggle with sliding background capsule */}
          <div className="flex p-1 mb-8 bg-slate-100 dark:bg-slate-950/80 rounded-xl relative overflow-hidden border border-slate-200/40 dark:border-slate-800/40">
            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleRoleChange("student")}
              className={`flex-1 flex items-center justify-center py-2.5 text-sm font-semibold rounded-lg transition-colors duration-200 z-10 cursor-pointer disabled:opacity-50 ${
                role === "student"
                  ? "text-indigo-600 dark:text-indigo-400 font-bold"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <GraduationCap className="w-4 h-4 mr-2" />
              Student
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleRoleChange("lecturer")}
              className={`flex-1 flex items-center justify-center py-2.5 text-sm font-semibold rounded-lg transition-colors duration-200 z-10 cursor-pointer disabled:opacity-50 ${
                role === "lecturer"
                  ? "text-indigo-600 dark:text-indigo-400 font-bold"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
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
                className="mb-6 p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/35 rounded-xl flex items-start text-rose-700 dark:text-rose-400"
              >
                <AlertCircle className="w-5 h-5 mr-2 shrink-0 mt-0.5" />
                <span className="text-xs font-semibold">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Login Form */}
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-800 dark:text-slate-200">
                Email address
              </label>
              <div className="mt-1.5">
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
                  className="appearance-none block w-full px-4 py-3 border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-slate-900 dark:text-white placeholder-slate-450 dark:placeholder-slate-500 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/55 dark:focus:ring-indigo-500/55 focus:border-indigo-500 sm:text-sm transition-all duration-200 disabled:opacity-50"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-800 dark:text-slate-200">
                Password
              </label>
              <div className="mt-1.5">
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
                  className="appearance-none block w-full px-4 py-3 border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-slate-900 dark:text-white placeholder-slate-450 dark:placeholder-slate-500 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/55 dark:focus:ring-indigo-500/55 focus:border-indigo-500 sm:text-sm transition-all duration-200 disabled:opacity-50"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4.5 w-4.5 text-indigo-650 focus:ring-indigo-500 border-slate-350 dark:border-slate-800 rounded bg-white dark:bg-slate-950"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-650 dark:text-slate-400">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-indigo-650 dark:text-indigo-400 hover:text-indigo-500 transition-colors">
                  Forgot password?
                </a>
              </div>
            </div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-650 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-205 cursor-pointer group disabled:opacity-50"
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