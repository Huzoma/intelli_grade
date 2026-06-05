"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Layers, ShieldCheck, Sparkles } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

// Framer Motion Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 15 },
  },
};

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Floating Theme Toggle */}
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>

      {/* Subtle Background Grid Pattern */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px]"></div>

      {/* Modern Ambient Aurora Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px] -z-10 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-violet-500/10 blur-[120px] -z-10 pointer-events-none"></div>
      
      <main className="flex flex-col items-center justify-center pt-28 pb-20 px-6 text-center max-w-7xl mx-auto">
        
        {/* Hero Section */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl space-y-8 flex flex-col items-center"
        >
          {/* Status Badge */}
          <motion.div 
            variants={itemVariants}
            className="inline-flex items-center rounded-full border border-indigo-200/80 dark:border-indigo-900/60 bg-indigo-50/80 dark:bg-indigo-950/40 px-4 py-1.5 text-sm font-semibold text-indigo-600 dark:text-indigo-400 mb-2 shadow-sm backdrop-blur-sm"
          >
            <span className="flex h-2.5 w-2.5 rounded-full bg-indigo-600 dark:bg-indigo-400 mr-2.5 animate-pulse"></span>
            IntelliGrade SaaS Architecture v1.0
          </motion.div>
          
          <motion.h1 
            variants={itemVariants}
            className="font-heading text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-7xl leading-tight"
          >
            Academic Evaluation, <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 dark:from-indigo-400 dark:via-violet-400 dark:to-purple-400">
              Beautifully Automated.
            </span>
          </motion.h1>
          
          <motion.p 
            variants={itemVariants}
            className="text-base sm:text-lg leading-relaxed text-slate-650 dark:text-slate-400 max-w-2xl mx-auto"
          >
            An intelligent SaaS ecosystem that handles document routing, cross-references grading rubrics, and generates technical viva questions—empowering educators to focus on what matters.
          </motion.p>

          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 w-full sm:w-auto"
          >
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/20 dark:shadow-indigo-500/10 transition-all duration-200 group cursor-pointer"
              >
                Access Portal
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <a
                href="#features"
                className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-slate-700 dark:text-slate-350 bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/80 shadow-sm backdrop-blur-sm transition-all duration-200 cursor-pointer"
              >
                Explore Architecture
              </a>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Feature Cards Grid */}
        <motion.div 
          id="features" 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mt-36 text-left"
        >
          {/* Feature 1 */}
          <motion.div 
            variants={itemVariants}
            className="glass-panel glass-panel-hover p-8 rounded-2xl flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center mb-6 shadow-inner">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="font-heading text-xl font-bold text-slate-900 dark:text-white mb-3">Smart Routing</h3>
              <p className="text-slate-650 dark:text-slate-400 leading-relaxed text-sm">
                Asynchronous RBAC document pipeline that securely maps student reports and logbooks directly to assigned lecturer grading rosters.
              </p>
            </div>
          </motion.div>

          {/* Feature 2 */}
          <motion.div 
            variants={itemVariants}
            className="glass-panel glass-panel-hover p-8 rounded-2xl flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 bg-violet-100 dark:bg-violet-950/80 text-violet-600 dark:text-violet-400 rounded-xl flex items-center justify-center mb-6 shadow-inner">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-heading text-xl font-bold text-slate-900 dark:text-white mb-3">AI Interrogation</h3>
              <p className="text-slate-650 dark:text-slate-400 leading-relaxed text-sm">
                Extracts key methodologies from complex PDF files to instantly generate specific, structured viva defense questions linked directly to rubric markers.
              </p>
            </div>
          </motion.div>

          {/* Feature 3 */}
          <motion.div 
            variants={itemVariants}
            className="glass-panel glass-panel-hover p-8 rounded-2xl flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center mb-6 shadow-inner">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-heading text-xl font-bold text-slate-900 dark:text-white mb-3">Advisory Flagging</h3>
              <p className="text-slate-650 dark:text-slate-400 leading-relaxed text-sm">
                Computes objective AI probabilistic writing score parameters to flag anomalies while mitigating inherent ESL expression bias during evaluations.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}