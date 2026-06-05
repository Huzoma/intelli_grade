"use client";

import { motion } from "framer-motion";
import { User, Bell, Shield } from "lucide-react";

export default function StudentSettingsClient({ user }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="max-w-4xl mx-auto p-4 sm:p-8 space-y-6 sm:space-y-8 bg-transparent text-slate-900 dark:text-slate-100"
    >
      <div>
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Account Settings</h1>
        <p className="text-sm sm:text-base text-slate-550 dark:text-slate-405 mt-1">Manage your university profile and notification preferences.</p>
      </div>

      <div className="glass-panel rounded-2xl shadow-lg overflow-hidden">
        {/* Profile Section */}
        <div className="p-6 sm:p-8 border-b border-slate-200/50 dark:border-slate-800/60">
          <div className="flex items-center gap-3 mb-6">
            <User className="w-5 h-5 text-blue-650 dark:text-blue-400" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Academic Profile</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-550 dark:text-slate-450 mb-1.5 uppercase tracking-wider">Full Name</label>
              <div className="px-4 py-3 bg-slate-50/50 dark:bg-slate-950/60 border border-slate-200/50 dark:border-slate-850 rounded-xl text-slate-900 dark:text-slate-100 font-semibold select-all transition-colors">
                {user.name}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-555 dark:text-slate-450 mb-1.5 uppercase tracking-wider">Matriculation Number</label>
              <div className="px-4 py-3 bg-slate-50/50 dark:bg-slate-950/60 border border-slate-200/50 dark:border-slate-850 rounded-xl text-slate-900 dark:text-slate-100 font-mono font-semibold select-all transition-colors">
                {user.matricNo || "N/A"}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-555 dark:text-slate-450 mb-1.5 uppercase tracking-wider">Department</label>
              <div className="px-4 py-3 bg-slate-50/50 dark:bg-slate-950/60 border border-slate-200/50 dark:border-slate-855 rounded-xl text-slate-900 dark:text-slate-100 font-semibold select-all transition-colors">
                {user.department || "Computer Science"}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-555 dark:text-slate-450 mb-1.5 uppercase tracking-wider">Academic Level</label>
              <div className="px-4 py-3 bg-slate-50/50 dark:bg-slate-950/60 border border-slate-200/50 dark:border-slate-850 rounded-xl text-slate-900 dark:text-slate-100 font-semibold select-all transition-colors">
                {user.level || "400 Level"}
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-5 flex items-center font-medium select-none">
            <Shield className="w-3.5 h-3.5 mr-1.5 text-blue-500" />
            Profile details are synced directly with the university registry and cannot be edited.
          </p>
        </div>

        {/* Notifications Section */}
        <div className="p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-5 h-5 text-blue-650 dark:text-blue-400" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Notification Preferences</h2>
          </div>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="pr-4">
                <p className="font-bold text-slate-900 dark:text-white">AI Evaluation Complete</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Receive an email when the AI finishes vetting your submission.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-slate-200 dark:bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 dark:after:border-slate-700 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-650 dark:peer-checked:bg-blue-500 shadow-inner"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="pr-4">
                <p className="font-bold text-slate-900 dark:text-white">Lecturer Grade Published</p>
                <p className="text-sm text-slate-500 dark:text-slate-405 font-medium">Receive an alert when your final grade and viva questions are posted.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-slate-200 dark:bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 dark:after:border-slate-700 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-650 dark:peer-checked:bg-blue-500 shadow-inner"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
