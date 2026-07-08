"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FileText, Clock, CheckCircle, ArrowRight } from "lucide-react";
import MetricCard from "@/components/MetricCard";
import { Table, TableRow, TableCell } from "@/components/DataTable";

// Framer motion variants
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
        return "bg-warning-bg text-warning border-warning-border";
      case "needs_grading":
        return "bg-review-bg text-review border-review-border";
      case "graded":
        return "bg-success-bg text-success border-success-border";
      default:
        return "bg-slate-50 dark:bg-slate-900 text-slate-700 border-slate-200 dark:border-slate-800";
    }
  };

  const getTypeBadgeClass = (type) => {
    switch (type) {
      case "it_report":
        return "bg-primary-light text-primary border-primary-border";
      case "project_proposal":
        return "bg-review-bg text-review border-review-border";
      default:
        return "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700";
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
      className="max-w-5xl mx-auto p-6 sm:p-8 space-y-6 sm:space-y-8 bg-transparent text-slate-900 dark:text-slate-100"
    >
      {/* Header Section */}
      <motion.div variants={itemVariants}>
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
          Welcome back, {user?.name.split(" ")[0]}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-semibold">
          Here is the current status of your academic submissions.
        </p>
      </motion.div>

      {/* Metric Cards */}
      <motion.div 
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <MetricCard title="Total Submissions" value={metrics.total} icon={FileText} type="default" />
        <MetricCard title="Pending Review" value={metrics.pending} icon={Clock} type="warning" />
        <MetricCard title="Graded" value={metrics.graded} icon={CheckCircle} type="success" />
      </motion.div>

      {/* Quick Action & Recent Submissions */}
      <motion.div 
        variants={itemVariants}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Call to Action Box */}
        <div className="lg:col-span-1">
          <motion.div 
            whileHover={{ y: -2 }}
            className="bg-primary rounded-2xl p-6 text-white shadow-sm border border-primary-border flex flex-col justify-between h-full"
          >
            <div>
              <h3 className="text-lg font-heading font-bold mb-2 tracking-tight">New Submission?</h3>
              <p className="text-white/80 text-xs mb-6 leading-relaxed font-semibold">
                Upload your IT report, project proposal, or course assignment for automated preliminary evaluation.
              </p>
            </div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/student/upload"
                className="inline-flex items-center justify-center w-full bg-white text-indigo-600 font-bold py-3 rounded-xl hover:bg-slate-50 transition-colors shadow-sm cursor-pointer group text-xs uppercase tracking-wider"
              >
                Start Upload 
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Recent Submissions Table */}
        <div className="lg:col-span-2">
          <Table 
            headers={["Document Title", "Type", "Status"]} 
            isEmpty={submissions.length === 0}
            emptyMessage="No submissions yet. Click 'Start Upload' to submit your first document."
          >
            {submissions.map((sub) => {
              const isClickable = sub.status !== "processing";
              const content = (
                <TableRow key={sub.id}>
                  <TableCell className="font-semibold text-slate-800 dark:text-slate-200">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary-light text-primary rounded-lg">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="truncate max-w-[180px] sm:max-w-xs">
                        <p className="truncate font-semibold">{sub.docTitle}</p>
                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5" suppressHydrationWarning>
                          {formatDate(sub.createdAt)} • {sub.fileSize}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full border ${getTypeBadgeClass(sub.type)}`}>
                      {getSubmissionTypeLabel(sub.type)}
                    </span>
                  </TableCell>
                  <TableCell align="right">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusClass(sub.status)}`}>
                      {getStatusLabel(sub.status)}
                    </span>
                  </TableCell>
                </TableRow>
              );

              if (isClickable) {
                return (
                  <Link key={sub.id} href={`/student/review/${sub.id}`} className="contents">
                    {content}
                  </Link>
                );
              }

              return content;
            })}
          </Table>
        </div>
      </motion.div>
    </motion.div>
  );
}










