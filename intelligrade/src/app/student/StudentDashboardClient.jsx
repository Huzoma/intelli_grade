"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FileText, Clock, CheckCircle, ArrowRight } from "lucide-react";

// Framer motion variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
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

export default function StudentDashboardClient({ user, submissions, metrics }) {
  const getSubmissionTypeLabel = (type) => {
    switch (type) {
      case "it_report":
        return "IT Report";
      case "project_proposal":
        return "Project Proposal";
      case "assignment":
        return "Course Assignment";
      default:
        return type;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "processing":
        return "AI Processing";
      case "needs_grading":
        return "Pending Review";
      case "graded":
        return "Graded";
      default:
        return status;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "processing":
        return "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/50";
      case "needs_grading":
        return "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border-purple-205 dark:border-purple-900/50";
      case "graded":
        return "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50";
      default:
        return "bg-slate-50 dark:bg-slate-900 text-slate-700 border-slate-205";
    }
  };

  const getTypeBadgeClass = (type) => {
    switch (type) {
      case "it_report":
        return "bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200/50 dark:border-blue-900/30";
      case "project_proposal":
        return "bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border-purple-200/50 dark:border-purple-900/30";
      default:
        return "bg-slate-100 dark:bg-slate-850 text-slate-700 dark:text-slate-300 border-slate-200/50 dark:border-slate-800/30";
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }) + " • " + d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="max-w-5xl mx-auto p-4 sm:p-8 space-y-6 sm:space-y-8 bg-transparent text-slate-900 dark:text-slate-100"
    >
      {/* Header Section */}
      <motion.div variants={itemVariants}>
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
          Welcome back, {user?.name.split(" ")[0]}
        </h1>
        <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1">
          Here is the current status of your academic submissions.
        </p>
      </motion.div>

      {/* Metric Cards */}
      <motion.div 
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <motion.div 
          whileHover={{ y: -4 }}
          className="glass-panel p-6 rounded-2xl flex items-center space-x-4"
        >
          <div className="p-3 bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 rounded-xl shadow-inner">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">Total Submissions</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">{metrics.total}</h3>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -4 }}
          className="glass-panel p-6 rounded-2xl flex items-center space-x-4"
        >
          <div className="p-3 bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 rounded-xl shadow-inner">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">Pending Review</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">{metrics.pending}</h3>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -4 }}
          className="glass-panel p-6 rounded-2xl flex items-center space-x-4"
        >
          <div className="p-3 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 rounded-xl shadow-inner">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">Graded</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">{metrics.graded}</h3>
          </div>
        </motion.div>
      </motion.div>

      {/* Quick Action & Recent Submissions */}
      <motion.div 
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        {/* Call to Action Box */}
        <div className="lg:col-span-1">
          <motion.div 
            whileHover={{ scale: 1.01 }}
            className="bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-blue-500 dark:to-indigo-650 rounded-2xl p-6 text-white shadow-lg shadow-indigo-500/10"
          >
            <h3 className="text-xl font-bold mb-2 tracking-tight">New Submission?</h3>
            <p className="text-blue-105 text-sm mb-6 leading-relaxed">
              Upload your IT report, project proposal, or course assignment for automated preliminary evaluation.
            </p>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/student/upload"
                className="inline-flex items-center justify-center w-full bg-white dark:bg-slate-100 text-blue-700 dark:text-indigo-950 font-bold py-3 rounded-xl hover:bg-slate-50 transition-colors shadow-sm cursor-pointer group"
              >
                Start Upload 
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Recent Submissions Table */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors flex flex-col justify-between">
          <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-slate-900 dark:text-white tracking-tight">Recent Submissions</h3>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {submissions.length === 0 ? (
              <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm">
                No submissions yet. Click &quot;Start Upload&quot; to submit your first document.
              </div>
            ) : (
              submissions.map((sub) => {
                const isClickable = sub.status !== "processing";
                const content = (
                  <motion.div 
                    whileHover={isClickable ? { backgroundColor: "rgba(99, 102, 241, 0.02)" } : {}}
                    className={`px-6 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${isClickable ? "cursor-pointer" : "cursor-not-allowed"}`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 rounded-lg">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-xs">{sub.docTitle}</p>
                          <span className={`text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full border w-max ${getTypeBadgeClass(sub.type)}`}>
                            {getSubmissionTypeLabel(sub.type)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-505 dark:text-slate-400 mt-0.5" suppressHydrationWarning>
                          {formatDate(sub.createdAt)} • {sub.fileSize}
                        </p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusClass(sub.status)}`}>
                      {getStatusLabel(sub.status)}
                    </span>
                  </motion.div>
                );

                if (isClickable) {
                  return (
                    <Link key={sub.id} href={`/student/review/${sub.id}`} className="block">
                      {content}
                    </Link>
                  );
                }

                return <div key={sub.id}>{content}</div>;
              })
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
