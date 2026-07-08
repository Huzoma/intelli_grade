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
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 15 },
  },
};

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground transition-colors duration-300">
      {/* Floating Theme Toggle */}
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>

      {/* Subtle Background Grid Pattern */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px]"></div>
      
      <main className="flex flex-col items-center justify-center pt-32 pb-20 px-6 text-center max-w-7xl mx-auto">
        
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
            className="inline-flex items-center rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2 shadow-sm backdrop-blur-sm"
          >
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
            IntelliGrade Platform Architecture v1.0
          </motion.div>
          
          <motion.h1 
            variants={itemVariants}
            className="font-heading text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-7xl leading-tight"
          >
            Academic Evaluation, <br className="hidden sm:block" />
            <span className="text-primary">
              Beautifully Automated.
            </span>
          </motion.h1>
          
          <motion.p 
            variants={itemVariants}
            className="text-base sm:text-lg leading-relaxed text-slate-600 dark:text-slate-400 max-w-2xl mx-auto"
          >
            An intelligent ecosystem that handles document routing, cross-references grading rubrics, and generates technical viva questions—empowering educators to focus on what matters.
          </motion.p>

          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 w-full sm:w-auto"
          >
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-8 py-4 text-sm font-semibold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-sm transition-all duration-200 group cursor-pointer"
              >
                Access Portal
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <a
                href="#features"
                className="inline-flex items-center justify-center px-8 py-4 text-sm font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 shadow-sm backdrop-blur-sm transition-all duration-200 cursor-pointer"
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
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto mt-36 text-left"
        >
          {/* Feature 1 */}
          <motion.div 
            variants={itemVariants}
            className="glass-panel p-6 rounded-2xl flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 bg-primary-light text-primary rounded-xl flex items-center justify-center mb-6 shadow-inner border border-primary-border">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-white mb-3">Smart Routing</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-xs">
                Asynchronous RBAC document pipeline that securely maps student reports and logbooks directly to assigned lecturer grading rosters.
              </p>
            </div>
          </motion.div>

          {/* Feature 2 */}
          <motion.div 
            variants={itemVariants}
            className="glass-panel p-6 rounded-2xl flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 bg-primary-light text-primary rounded-xl flex items-center justify-center mb-6 shadow-inner border border-primary-border">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-white mb-3">AI Interrogation</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-xs">
                Extracts key methodologies from complex PDF files to instantly generate specific, structured viva defense questions linked directly to rubric markers.
              </p>
            </div>
          </motion.div>

          {/* Feature 3 */}
          <motion.div 
            variants={itemVariants}
            className="glass-panel p-6 rounded-2xl flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 bg-primary-light text-primary rounded-xl flex items-center justify-center mb-6 shadow-inner border border-primary-border">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-white mb-3">Advisory Flagging</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-xs">
                Computes objective AI probabilistic writing score parameters to flag anomalies while mitigating inherent ESL expression bias during evaluations.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}