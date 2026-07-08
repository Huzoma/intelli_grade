"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Download, 
  Maximize2, 
  ZoomIn, 
  ZoomOut,
  ListChecks,
  MessageSquare,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import CommentCard from "@/components/CommentCard";
import TextHighlighter from "@/components/TextHighlighter";

export default function StudentReviewClient({ submission, rubricCriteria }) {
  const [activeTab, setActiveTab] = useState("rubric");
  const [zoom, setZoom] = useState(100);
  const [viewMode, setViewMode] = useState("reader"); // 'reader' | 'pdf' | 'summary'

  // Local copy of comments (read-only for student)
  const localComments = submission.comments || [];

  // Normalize rubricCriteria to object format: { text: string, points: number }
  const normalizedCriteria = rubricCriteria.map((item) => {
    if (typeof item === "string") {
      return { text: item, points: 10 };
    }
    return {
      text: item.text || "",
      points: typeof item.points === "number" ? item.points : 10,
    };
  });

  // Prepare highlights for comments only (No Viva questions highlighted for students)
  const highlights = localComments.map(c => ({
    id: `comment-${c.id}`,
    text: c.quote,
    type: "comment",
    color: "bg-warning-bg/40 border-b border-warning text-slate-900 dark:text-white",
  }));

  // Scroll to a specific comment highlight in reader
  const handleScrollToHighlight = (id) => {
    setViewMode("reader");
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        element.classList.add("highlight-flash");
        setTimeout(() => {
          element.classList.remove("highlight-flash");
        }, 2000);
      }
    }, 150);
  };

  // Flash card in right pane sidebar when clicked in reader
  const flashSidebarCard = (id) => {
    if (id.startsWith("comment-")) {
      const cardId = `comment-card-${id.replace("comment-", "")}`;
      setTimeout(() => {
        const element = document.getElementById(cardId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "nearest" });
          element.classList.add("card-flash");
          setTimeout(() => {
            element.classList.remove("card-flash");
          }, 2000);
        }
      }, 200);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-955 text-slate-900 dark:text-slate-100 transition-colors duration-300 overflow-hidden relative">
      
      {/* Top Header Workspace Bar */}
      <header className="h-16 border-b border-slate-200/60 dark:border-slate-800/80 bg-slate-950 flex items-center justify-between px-6 shrink-0 z-10 shadow-md">
        <div className="flex items-center space-x-6">
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link 
              href="/student" 
              className="flex items-center text-sm font-semibold text-slate-300 dark:text-slate-400 hover:text-indigo-400 transition-colors bg-slate-900/60 dark:bg-slate-900/60 px-3.5 py-2 rounded-xl border border-slate-800 dark:border-slate-800/60 shadow-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </motion.div>
          <div className="h-6 w-px bg-slate-800"></div>
          <div>
            <h1 className="font-heading text-sm sm:text-base font-bold text-white leading-tight truncate max-w-[200px] sm:max-w-xs">
              {submission.docTitle}
            </h1>
            <p className="text-[11px] text-slate-400">
              Feedback Workspace • Submitted by You
            </p>
          </div>
        </div>

        {/* Grade Display */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 space-x-2">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider select-none">
              {submission.status === "graded" ? "Final Score:" : "Suggested Score:"}
            </span>
            <span className="text-white font-extrabold text-lg">
              {submission.humanScore !== null ? `${submission.humanScore}%` : "Pending"}
            </span>
          </div>
        </div>
      </header>

      {/* Main Split Workspace */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Pane: PDF / Reader Area */}
        <section className="flex-1 flex flex-col bg-slate-100/30 dark:bg-slate-900/20 relative overflow-hidden">
          
          {/* View Mode Switcher */}
          <div className="flex justify-between items-center px-6 py-3 bg-white dark:bg-slate-955 border-b border-slate-200/50 dark:border-slate-800/85 shrink-0 z-10">
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setViewMode("reader")}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${viewMode === "reader" ? "bg-indigo-650 text-white shadow-sm" : "bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"}`}
              >
                📖 Interactive Reader
              </button>
              <button
                type="button"
                onClick={() => setViewMode("pdf")}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${viewMode === "pdf" ? "bg-indigo-650 text-white shadow-sm" : "bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"}`}
              >
                📄 Original PDF
              </button>
              <button
                type="button"
                onClick={() => setViewMode("summary")}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${viewMode === "summary" ? "bg-indigo-650 text-white shadow-sm" : "bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"}`}
              >
                📝 AI Summary & Details
              </button>
            </div>
            <span className="text-xs font-semibold text-slate-555 dark:text-slate-400">
              {viewMode === "reader" ? "Interactive Reader Mode" : viewMode === "pdf" ? "Original PDF View" : "Generated Academic Insights"}
            </span>
          </div>

          {/* PDF Toolbar - Only display in PDF view */}
          {viewMode === "pdf" && (
            <motion.div 
              initial={{ y: 50, x: "-50%", opacity: 0 }}
              animate={{ y: 0, x: "-50%", opacity: 1 }}
              transition={{ type: "spring", stiffness: 100, damping: 15 }}
              className="absolute bottom-6 left-1/2 flex items-center bg-slate-900/90 text-white px-5 py-2.5 rounded-full shadow-2xl space-x-4.5 z-10 backdrop-blur-md border border-slate-700/60"
            >
              <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.85 }} className="p-1 hover:bg-slate-800 rounded-md transition-colors cursor-pointer" onClick={() => setZoom(z => Math.max(50, z - 10))}><ZoomOut className="w-4 h-4" /></motion.button>
              <span className="text-xs sm:text-sm font-bold min-w-12 text-center select-none">{zoom}%</span>
              <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.85 }} className="p-1 hover:bg-slate-800 rounded-md transition-colors cursor-pointer" onClick={() => setZoom(z => Math.min(200, z + 10))}><ZoomIn className="w-4 h-4" /></motion.button>
              <div className="w-px h-4 bg-slate-700"></div>
              <span className="text-xs sm:text-sm select-none">Page Viewer</span>
              <div className="w-px h-4 bg-slate-700"></div>
              <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.85 }} className="p-1 hover:bg-slate-800 rounded-md transition-colors cursor-pointer"><Maximize2 className="w-4 h-4" /></motion.button>
              <a href={submission.filePath} download className="p-1 hover:bg-slate-800 rounded-md text-white transition-colors cursor-pointer"><Download className="w-4 h-4" /></a>
            </motion.div>
          )}

          {/* Document Content View */}
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            <motion.div 
              layout
              className="bg-white dark:bg-slate-950 mx-auto shadow-xl border border-slate-200/80 dark:border-slate-800/80 rounded-xl transition-colors relative overflow-hidden"
              animate={{ width: `${816 * (zoom / 100)}px` }}
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
            >
              {viewMode === "reader" ? (
                <div className="p-12 space-y-6 select-text outline-none text-slate-900 dark:text-slate-100">
                  <div className="border-b pb-6 mb-8 border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-mono uppercase tracking-wider text-indigo-650 dark:text-indigo-400 font-bold">
                      Interactive Document Reader
                    </span>
                    <h2 className="text-2xl font-bold mt-2 text-slate-850 dark:text-slate-100">
                      {submission.docTitle}
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1" suppressHydrationWarning>
                      Submitted on {new Date(submission.date).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="space-y-6 text-slate-700 dark:text-slate-300 leading-relaxed text-base">
                    {submission.fullText ? (
                      submission.fullText.split("\n\n").map((para, paraIdx) => (
                        <p key={paraIdx} className="paragraph-block select-text">
                          <TextHighlighter
                            paragraphText={para}
                            paraIndex={paraIdx}
                            highlights={highlights}
                            onHighlightClick={(e, hl) => {
                              setActiveTab("comments");
                              flashSidebarCard(hl.id);
                            }}
                          />
                        </p>
                      ))
                    ) : (
                      <p className="italic text-slate-500">
                        No full-text representation available. Please view the original PDF.
                      </p>
                    )}
                  </div>
                </div>
              ) : viewMode === "pdf" ? (
                <iframe
                  src={submission.filePath}
                  className="w-full border-0"
                  style={{ height: '78vh' }}
                  title={submission.docTitle}
                />
              ) : (
                /* Document Presentation Layer */
                <div className="p-12 space-y-6 select-text">
                  <div className="border-b pb-6 mb-8 border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-mono uppercase tracking-wider text-primary font-bold">Academic Evaluation Document</span>
                    <h2 className="text-2xl font-bold mt-2 text-slate-850 dark:text-slate-100">{submission.docTitle}</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1" suppressHydrationWarning>Submitted on {new Date(submission.date).toLocaleDateString()}</p>
                  </div>
                  
                  <div className="space-y-4 text-slate-600 dark:text-slate-350 leading-relaxed text-sm">
                    <p className="font-semibold text-slate-900 dark:text-white">Document Summary:</p>
                    <p className="whitespace-pre-line">{submission.summary || "No academic summary generated for this document."}</p>
                    
                    <div className="p-5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Document Metadata</p>
                      <div className="grid grid-cols-2 gap-4 text-xs font-medium text-slate-600 dark:text-slate-400">
                        <div>File Path: <code className="bg-slate-100 dark:bg-slate-955 px-1 py-0.5 rounded">{submission.filePath}</code></div>
                        <div>File Size: <span className="font-semibold">{submission.fileSize}</span></div>
                        <div>Type Class: <span className="font-semibold capitalize">{submission.type.replace("_", " ")}</span></div>
                        <div>DB Record ID: <code className="bg-slate-100 dark:bg-slate-950 px-1 py-0.5 rounded">{submission.id}</code></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </section>

        {/* Right Pane: Rubrics & Comments */}
        <aside className="w-96 sm:w-[450px] shrink-0 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col shadow-[-4px_0_24px_rgba(0,0,0,0.02)] z-20 transition-colors">
          
          {/* Tabs - Rubric and Comments ONLY (No Viva Tab!) */}
          <div className="flex px-3 pt-4 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 shrink-0">
            {[
              { id: "rubric", icon: ListChecks, label: "Feedback Rubric" },
              { id: "comments", icon: MessageSquare, label: "Lecturer Comments" }
            ].map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer relative rounded-t-lg ${
                    isActive
                      ? "text-primary bg-white dark:bg-slate-900 shadow-sm border-t border-x border-slate-200 dark:border-slate-800"
                      : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                  }`}
                >
                  <tab.icon className={`w-4 h-4 mr-2 ${isActive ? "text-primary" : "text-slate-400 dark:text-slate-500"}`} />
                  {tab.label}
                  {isActive && (
                    <motion.div
                      layoutId="studentTabIndicator"
                      className="absolute bottom-[-2px] left-0 right-0 h-[2px] bg-primary"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab Content Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar relative">
            <AnimatePresence mode="wait">
              {activeTab === "rubric" && (
                <motion.div
                  key="rubric"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.18 }}
                  className="space-y-6"
                >
                  <div className="p-4 bg-primary-light border border-primary-border rounded-xl flex items-start transition-colors">
                    <AlertCircle className="w-5 h-5 text-primary mr-3 shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-750 dark:text-slate-300 leading-relaxed font-semibold">
                      This rubric outlines the assessment categories evaluated by your lecturer. Use this feedback to update and improve your submission.
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    {normalizedCriteria.map((crit, i) => (
                      <div 
                        key={i} 
                        className="flex items-start p-3.5 rounded-xl border border-slate-200 dark:border-slate-850/80 bg-slate-50/50 dark:bg-slate-950/50"
                      >
                        <div className="relative flex items-center justify-center w-5 h-5 mr-3 mt-0.5 shrink-0">
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div className="flex-1 flex justify-between items-start gap-4">
                          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 leading-tight">
                            {crit.text}
                          </span>
                          <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md border shrink-0 ${
                            crit.points > 0 
                              ? "bg-success-bg text-success border-success-border" 
                              : "bg-danger-bg text-danger border-danger-border"
                          }`}>
                            {crit.points > 0 ? `+${crit.points} pts` : `${crit.points} pts`}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
              
              {activeTab === "comments" && (
                <motion.div
                  key="comments"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.18 }}
                  className="space-y-6 w-full text-left"
                >
                  <style>{`
                    .highlight-flash {
                      animation: highlightFlash 2s cubic-bezier(0.16, 1, 0.3, 1) !important;
                      border-radius: 4px;
                      padding: 2px 4px;
                    }
                    .card-flash {
                      animation: cardFlash 2s cubic-bezier(0.16, 1, 0.3, 1) !important;
                    }
                    @keyframes highlightFlash {
                      0% { background-color: rgba(245, 158, 11, 0.4) !important; color: inherit !important; }
                      100% { }
                    }
                    @keyframes cardFlash {
                      0% { border-color: var(--primary) !important; background-color: var(--primary-light) !important; }
                      100% { }
                    }
                  `}</style>
                  
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-heading text-sm font-bold text-slate-900 dark:text-white flex items-center">
                      <MessageSquare className="w-4 h-4 mr-2 text-primary" />
                      Lecturer Feedback
                    </h3>
                    <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full">
                      {localComments.length} annotations
                    </span>
                  </div>

                  {localComments.length > 0 ? (
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                      {localComments.map((c) => (
                        <CommentCard
                          key={c.id}
                          comment={c}
                          onFocusQuote={handleScrollToHighlight}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col h-full min-h-60 justify-center items-center text-center p-4">
                      <MessageSquare className="w-10 h-10 text-slate-400 dark:text-slate-600 mb-3" />
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">No feedback comments yet</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed max-w-64 font-semibold">
                        Your lecturer has not annotated any text passages in your submission yet.
                      </p>
                    </div>
                  )}
                 </motion.div>
              )}
            </AnimatePresence>
          </div>
        </aside>
      </main>
    </div>
  );
}
