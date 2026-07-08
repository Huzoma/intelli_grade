"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Info, Download, UserPlus } from "lucide-react";

export default function RosterClient({ students }) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredStudents = students.filter(student => {
    const searchLower = searchQuery.toLowerCase();
    return (
      student.name.toLowerCase().includes(searchLower) ||
      student.matricNo.toLowerCase().includes(searchLower) ||
      student.email.toLowerCase().includes(searchLower)
    );
  });

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="max-w-6xl mx-auto p-4 sm:p-8 space-y-6 sm:space-y-8 bg-transparent text-slate-900 dark:text-slate-100"
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">CS Department Roster</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-semibold">
            Manage enrolled students and view their academic standing.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-auto">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Find student..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2.5 w-full sm:w-64 border border-slate-200 dark:border-slate-800 rounded-xl text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-border shadow-sm transition-colors" 
            />
          </div>
        </div>
      </div>

      <div className="bg-primary-light border border-primary-border rounded-xl p-4 flex items-start gap-3 transition-colors">
        <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
        <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-semibold">
          Department Info: <span className="font-medium text-slate-600 dark:text-slate-400">This list displays active matriculated students registered under the Computer Science department. It counts submissions currently in the grading queue or completed.</span>
        </p>
      </div>

      <div className="glass-panel rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-800">
                <th className="px-6 py-4.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Student Name</th>
                <th className="px-6 py-4.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Matric No.</th>
                <th className="px-6 py-4.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Level</th>
                <th className="px-6 py-4.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Submissions</th>
                <th className="px-6 py-4.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-500 dark:text-slate-400 text-sm">
                    No students match your query.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, idx) => (
                  <motion.tr 
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.04, type: "spring", stiffness: 300, damping: 25 }}
                    key={student.id} 
                    className="hover:bg-slate-500/[0.015] dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white flex items-center">
                      <div className="w-8.5 h-8.5 rounded-full bg-primary-light text-primary flex items-center justify-center mr-3 text-xs font-extrabold flex-shrink-0 shadow-inner">
                        {student.name.charAt(0)}
                      </div>
                      <span className="truncate font-semibold text-slate-800 dark:text-slate-200">{student.name}</span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-500 dark:text-slate-400">{student.matricNo}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-500 dark:text-slate-400">{student.level}</td>
                    <td className="px-6 py-4 text-sm text-slate-900 dark:text-white font-bold">{student.submissionsCount}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border whitespace-nowrap bg-success-bg text-success border-success-border">
                        Active
                      </span>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
