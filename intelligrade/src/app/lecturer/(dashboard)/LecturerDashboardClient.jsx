"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, FileText, AlertTriangle, 
  CheckCircle, ChevronRight, BrainCircuit
} from "lucide-react";
import MetricCard from "@/components/MetricCard";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 15 },
  },
};

const rowVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 },
};

export default function LecturerDashboardClient({ user, submissions, metrics }) {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const getSubmissionTypeLabel = (type) => {
    switch (type) {
      case "it_report":
        return "IT Report";
      case "project_proposal":
        return "Project Proposal";
      case "assignment":
        return "Assignment";
      default:
        return type;
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }) + ", " + d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  };

  // Search and Filter Logic
  const filteredSubmissions = submissions.filter((sub) => {
    const matchesTab = activeTab === "all" || sub.status === activeTab;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      sub.studentName.toLowerCase().includes(searchLower) ||
      sub.matricNo.toLowerCase().includes(searchLower) ||
      sub.docTitle.toLowerCase().includes(searchLower);
    
    return matchesTab && matchesSearch;
  });

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="max-w-7xl mx-auto p-6 sm:p-8 space-y-6 sm:space-y-8 bg-transparent text-slate-900 dark:text-slate-100"
    >
      {/* Header Section */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Submission Queue</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-semibold">Review, triage, and grade incoming CS documents.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-auto">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Search name or matric..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2.5 w-full sm:w-64 border border-slate-200 dark:border-slate-800 rounded-xl text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-border shadow-sm transition-all"
            />
          </div>
        </div>
      </motion.div>

      {/* Dynamic Metric Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard title="Total" value={metrics.total} icon={FileText} type="default" />
        <MetricCard title="Processing" value={metrics.processing} icon={BrainCircuit} type="warning" />
        <MetricCard title="Needs Grading" value={metrics.needsGrading} icon={AlertTriangle} type="review" />
        <MetricCard title="Graded" value={metrics.graded} icon={CheckCircle} type="success" />
      </motion.div>

      {/* Main Data Table Area */}
      <motion.div variants={itemVariants} className="glass-panel rounded-2xl shadow-lg overflow-hidden">
        
        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto border-b border-slate-200/50 dark:border-slate-800/50 px-2 sm:px-4 hide-scrollbar">
          {[
            { id: "all", label: "All Submissions" },
            { id: "processing", label: "AI Processing" },
            { id: "needs_grading", label: "Needs Grading" },
            { id: "graded", label: "Completed" }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 sm:px-4 py-4 text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors relative cursor-pointer ${
                  isActive 
                    ? "text-indigo-650 dark:text-indigo-400" 
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
              >
                {tab.label}
                {isActive && (
                  <motion.div
                    layoutId="activeTabUnderline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        <div className="overflow-x-auto min-h-75">
          <table className="w-full text-left border-collapse min-w-200">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-800">
                <th className="px-6 py-4.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Student & Document</th>
                <th className="px-6 py-4.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">AI Analysis</th>
                <th className="px-6 py-4.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              <AnimatePresence mode="popLayout">
                {filteredSubmissions.length === 0 ? (
                  <motion.tr
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500 dark:text-slate-400 text-sm">
                      No submissions match your search or filter.
                    </td>
                  </motion.tr>
                ) : (
                  filteredSubmissions.map((sub) => (
                    <motion.tr 
                      layout
                      variants={rowVariants}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                      key={sub.id} 
                      className="hover:bg-slate-500/[0.02] dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="px-6 py-4.5">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-slate-900 dark:text-white truncate max-w-50 sm:max-w-xs">{sub.docTitle}</span>
                          <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{sub.studentName} • {sub.matricNo}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-105 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800/40">
                          {getSubmissionTypeLabel(sub.type)}
                        </span>
                      </td>
                      <td className="px-6 py-4.5">
                        {sub.status === "processing" ? (
                          <span className="flex items-center text-xs text-slate-500 dark:text-slate-400"><BrainCircuit className="w-3.5 h-3.5 mr-1.5 animate-pulse text-amber-500" />Scanning...</span>
                        ) : (
                          <div className="flex items-center">
                            <div className={`w-2 h-2 rounded-full mr-2 ${sub.aiScore > 75 ? "bg-rose-500" : sub.aiScore > 40 ? "bg-amber-500" : "bg-emerald-500"}`}></div>
                            <span className={`text-xs font-semibold ${sub.aiScore > 75 ? "text-rose-700 dark:text-rose-400" : "text-slate-600 dark:text-slate-400"}`}>{sub.aiScore}% AI</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4.5">
                        {sub.status === "needs_grading" && <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-review-bg text-review border border-review-border">Needs Grading</span>}
                        {sub.status === "processing" && <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-warning-bg text-warning border border-warning-border">Processing</span>}
                        {sub.status === "graded" && <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-success-bg text-success border border-success-border">Completed ({sub.humanScore}%)</span>}
                      </td>
                      <td className="px-6 py-4.5 text-right">
                        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="inline-block">
                          <Link href={`/lecturer/review/${sub.id}`} className={`inline-flex items-center px-3.5 py-1.5 rounded-xl text-sm font-semibold transition-all shadow-sm ${sub.status === "needs_grading" ? "bg-primary text-white hover:bg-primary-hover border border-transparent" : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"}`}>
                            {sub.status === "graded" ? "View" : "Review"}<ChevronRight className="w-4 h-4 ml-1" />
                          </Link>
                        </motion.div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
