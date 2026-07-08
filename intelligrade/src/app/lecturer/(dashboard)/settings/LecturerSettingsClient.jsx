"use client";

import { motion } from "framer-motion";
import { User, BrainCircuit } from "lucide-react";
import { useState } from "react";

export default function LecturerSettingsClient({ user }) {
  const [threshold, setThreshold] = useState(75);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="max-w-4xl mx-auto p-4 sm:p-8 space-y-6 sm:space-y-8 bg-transparent text-slate-900 dark:text-slate-100"
    >
      <div>
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Educator Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-semibold">Manage your profile, notifications, and AI processing parameters.</p>
      </div>

      <div className="glass-panel rounded-2xl shadow-lg overflow-hidden">
        {/* Profile */}
        <div className="p-6 sm:p-8 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-6">
            <User className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Faculty Profile</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-450 mb-1.5 uppercase tracking-wider font-heading">Full Name</label>
              <div className="px-4 py-3 bg-slate-50/50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 font-semibold select-all transition-colors">
                {user.name}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-450 mb-1.5 uppercase tracking-wider font-heading">Department</label>
              <div className="px-4 py-3 bg-slate-50/50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 font-semibold select-all transition-colors">
                {user.department || "Computer Science"}
              </div>
            </div>
          </div>
        </div>

        {/* AI Configurations */}
        <div className="p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <BrainCircuit className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">AI Evaluation Engine</h2>
          </div>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-slate-900 dark:text-slate-200 select-none">AI Flagging Threshold</label>
                <span className="text-xs font-bold text-primary">{threshold}% Probability</span>
              </div>
              <input 
                type="range" 
                min="50" 
                max="100" 
                value={threshold}
                onChange={(e) => setThreshold(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary transition-colors" 
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-semibold">Documents exceeding this AI probability score will be flagged with a red warning badge.</p>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="pr-4">
                <p className="font-bold text-slate-900 dark:text-white">Auto-Generate Viva Questions</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold">Extract 3-5 technical questions from every submitted PDF.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0 select-none">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-slate-200 dark:bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
