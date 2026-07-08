"use client";

import { motion } from "framer-motion";

export default function MetricCard({ title, value, icon: Icon, type = "default" }) {
  const getColors = () => {
    switch (type) {
      case "success":
        return {
          bg: "bg-success-bg dark:bg-success-bg",
          text: "text-success",
          border: "border-success-border",
        };
      case "warning":
        return {
          bg: "bg-warning-bg dark:bg-warning-bg",
          text: "text-warning",
          border: "border-warning-border",
        };
      case "danger":
        return {
          bg: "bg-danger-bg dark:bg-danger-bg",
          text: "text-danger",
          border: "border-danger-border",
        };
      case "review":
        return {
          bg: "bg-review-bg dark:bg-review-bg",
          text: "text-review",
          border: "border-review-border",
        };
      default:
        return {
          bg: "bg-primary-light dark:bg-primary-light",
          text: "text-primary",
          border: "border-primary-border",
        };
    }
  };

  const colors = getColors();

  return (
    <motion.div 
      whileHover={{ y: -2 }}
      className={`glass-panel p-6 rounded-2xl flex items-center space-x-4 border ${colors.border}`}
    >
      <div className={`p-3 rounded-xl ${colors.bg} ${colors.text} shadow-inner`}>
        {Icon && <Icon className="w-6 h-6" />}
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 select-none uppercase tracking-wider">{title}</p>
        <h3 className="text-2xl font-heading font-bold text-slate-900 dark:text-white mt-1">{value}</h3>
      </div>
    </motion.div>
  );
}
