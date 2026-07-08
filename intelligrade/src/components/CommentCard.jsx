"use client";

import { motion } from "framer-motion";
import { Trash2, MessageSquare } from "lucide-react";

export default function CommentCard({ comment, onDelete, onFocusQuote }) {
  const formattedDate = () => {
    try {
      return new Date(comment.date).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return comment.date;
    }
  };

  return (
    <motion.div
      id={`comment-card-${comment.id}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl relative group hover:border-primary-border transition-all shadow-sm"
    >
      {onDelete && (
        <button
          onClick={() => onDelete(comment.id)}
          className="absolute top-4 right-4 text-slate-400 hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          title="Delete Comment"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
      <p className="text-sm font-semibold text-slate-850 dark:text-slate-200 pr-6 leading-normal select-text">
        {comment.text}
      </p>
      
      {comment.quote && (
        <div 
          onClick={() => onFocusQuote && onFocusQuote(`comment-${comment.id}`)}
          className={`mt-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-450 italic hover:border-primary-border transition-all leading-normal select-text ${onFocusQuote ? "cursor-pointer" : ""}`}
          title={onFocusQuote ? "Click to locate quote in document reader" : ""}
        >
          <span className="font-bold text-[10px] uppercase tracking-wider text-primary block not-italic mb-1">
            Quoted Context {onFocusQuote && "(Click to locate)"}:
          </span>
          &quot;{comment.quote}&quot;
        </div>
      )}
      <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-2" suppressHydrationWarning>
        {formattedDate()}
      </span>
    </motion.div>
  );
}
