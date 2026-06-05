"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Download, 
  Maximize2, 
  ZoomIn, 
  ZoomOut,
  BrainCircuit,
  ListChecks,
  MessageSquare,
  ShieldCheck,
  PlusCircle,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { toggleVivaQuestionAction, submitGradeAction } from "@/app/actions/grading";
import { toast } from "sonner";

export default function ReviewWorkspaceClient({ submission, vivaQuestions, rubricCriteria }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("ai_insights");
  const [zoom, setZoom] = useState(100);
  const [grade, setGrade] = useState(submission.humanScore !== null ? submission.humanScore : "");
  const [localQuestions, setLocalQuestions] = useState(vivaQuestions);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Track rubric criteria checkbox checks locally for draft state
  const [checkedCriteria, setCheckedCriteria] = useState(
    new Array(rubricCriteria.length).fill(false)
  );

  const handleCheckboxChange = (index) => {
    const updated = [...checkedCriteria];
    updated[index] = !updated[index];
    setCheckedCriteria(updated);

    // Dynamic grading helper: calculate recommended score based on criteria met
    const checkedCount = updated.filter(Boolean).length;
    const recommendation = Math.round((checkedCount / rubricCriteria.length) * 100);
    setGrade(recommendation);
  };

  const handleToggleQuestion = async (id, currentAdded) => {
    // Optimistically toggle status
    setLocalQuestions(prev => prev.map(q => q.id === id ? { ...q, added: !currentAdded } : q));
    
    const result = await toggleVivaQuestionAction(id, !currentAdded);
    if (result.error) {
      // Revert if database error occurs
      setLocalQuestions(prev => prev.map(q => q.id === id ? { ...q, added: currentAdded } : q));
      toast.error(result.error);
    } else {
      toast.success(!currentAdded ? "Question added to grading sheet" : "Question removed");
    }
  };

  const handleSaveDraft = async () => {
    if (grade === "") {
      toast.error("Please enter a grade score before saving draft.");
      return;
    }
    setIsSubmitting(true);
    const result = await submitGradeAction(submission.id, grade, "needs_grading");
    setIsSubmitting(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Draft saved successfully!");
    }
  };

  const handleSubmitFinalGrade = async () => {
    if (grade === "") {
      toast.error("Please enter a final grade percentage.");
      return;
    }
    setIsSubmitting(true);
    const result = await submitGradeAction(submission.id, grade, "graded");
    setIsSubmitting(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Final grade submitted! Submission completed.");
      router.push("/lecturer");
      router.refresh();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 overflow-hidden relative">
      
      {/* Top Header Workspace Bar */}
      <header className="h-16 border-b border-slate-200/60 dark:border-slate-800/80 bg-slate-950 flex items-center justify-between px-6 shrink-0 z-10 shadow-md">
        <div className="flex items-center space-x-6">
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link 
              href="/lecturer" 
              className="flex items-center text-sm font-semibold text-slate-300 dark:text-slate-400 hover:text-indigo-400 transition-colors bg-slate-900/60 dark:bg-slate-900/60 px-3.5 py-2 rounded-xl border border-slate-800 dark:border-slate-800/60 shadow-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Exit Workspace
            </Link>
          </motion.div>
          <div className="h-6 w-px bg-slate-800"></div>
          <div>
            <h1 className="font-heading text-sm sm:text-base font-bold text-white leading-tight truncate max-w-[200px] sm:max-w-xs">
              {submission.docTitle}
            </h1>
            <p className="text-[11px] text-slate-400">
              {submission.studentName} • {submission.matricNo}
            </p>
          </div>
        </div>

        {/* Action controls including numeric grade input */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 space-x-2">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider select-none">Score:</span>
            <input 
              type="number" 
              min="0" 
              max="100" 
              value={grade} 
              onChange={(e) => setGrade(e.target.value)} 
              className="w-12 bg-transparent border-0 text-white font-bold text-center text-sm focus:ring-0 focus:outline-none placeholder-slate-700"
              placeholder="--"
            />
            <span className="text-slate-400 font-semibold text-sm select-none">%</span>
          </div>

          <motion.button 
            whileHover={{ scale: 1.03 }} 
            whileTap={{ scale: 0.97 }}
            onClick={handleSaveDraft}
            disabled={isSubmitting}
            className="inline-flex items-center justify-center px-4 py-2.5 text-xs sm:text-sm font-bold text-indigo-300 bg-indigo-500/10 border border-indigo-500/30 rounded-xl hover:bg-indigo-500/20 disabled:opacity-50 transition-colors cursor-pointer"
          >
            Save Draft
          </motion.button>
          
          <motion.button 
            whileHover={{ scale: 1.03 }} 
            whileTap={{ scale: 0.97 }}
            onClick={handleSubmitFinalGrade}
            disabled={isSubmitting}
            className="inline-flex items-center justify-center px-4 py-2.5 text-xs sm:text-sm font-bold text-white bg-indigo-650 rounded-xl hover:bg-indigo-700 hover:shadow-lg disabled:opacity-50 transition-all cursor-pointer"
          >
            Submit Final Grade
          </motion.button>
        </div>
      </header>

      {/* Main Split Workspace */}
      <main className="flex-1 flex overflow-hidden">
        
        {/* Left Pane: PDF Viewer Area */}
        <section className="flex-1 flex flex-col bg-slate-100/30 dark:bg-slate-900/20 relative overflow-hidden">
          
          {/* PDF Toolbar */}
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
            <span className="text-xs sm:text-sm select-none">Page 1 of 1</span>
            <div className="w-px h-4 bg-slate-700"></div>
            <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.85 }} className="p-1 hover:bg-slate-800 rounded-md transition-colors cursor-pointer"><Maximize2 className="w-4 h-4" /></motion.button>
            <a href={submission.filePath} download className="p-1 hover:bg-slate-800 rounded-md text-white transition-colors cursor-pointer"><Download className="w-4 h-4" /></a>
          </motion.div>

          {/* PDF Document Container */}
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            <motion.div 
              layout
              className="bg-white dark:bg-slate-950 mx-auto shadow-xl border border-slate-200/80 dark:border-slate-800/80 min-h-264 rounded-xl transition-colors relative"
              animate={{ width: `${816 * (zoom / 100)}px` }}
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
            >
              {/* Document Presentation Layer */}
              <div className="p-12 space-y-6">
                <div className="border-b pb-6 mb-8 border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-mono uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-bold">Academic Evaluation Document</span>
                  <h2 className="text-2xl font-bold mt-2 text-slate-850 dark:text-slate-100">{submission.docTitle}</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1" suppressHydrationWarning>Submitted by {submission.studentName} ({submission.matricNo}) on {new Date(submission.date).toLocaleDateString()}</p>
                </div>
                
                <div className="space-y-4 text-slate-750 dark:text-slate-300 leading-relaxed text-sm">
                  <p className="font-semibold text-slate-900 dark:text-white">Document Summary:</p>
                  <p>{submission.summary || "No academic summary generated for this document."}</p>
                  
                  <div className="p-5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2">
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Document Metadata</p>
                    <div className="grid grid-cols-2 gap-4 text-xs font-medium text-slate-700 dark:text-slate-350">
                      <div>File Path: <code className="bg-slate-100 dark:bg-slate-950 px-1 py-0.5 rounded">{submission.filePath}</code></div>
                      <div>File Size: <span className="font-semibold">{submission.fileSize}</span></div>
                      <div>Type Class: <span className="font-semibold capitalize">{submission.type.replace("_", " ")}</span></div>
                      <div>DB Record ID: <code className="bg-slate-100 dark:bg-slate-950 px-1 py-0.5 rounded">{submission.id}</code></div>
                    </div>
                  </div>

                  <p>Lecturers should review the text matching details inside this workspace container. Ensure full rubric alignment, toggle relevant student viva quiz questions using the interactive assistant panel on the right, and input the appropriate grading marks.</p>
                </div>

                {/* Aesthetic filler lines to emulate PDF representation */}
                <div className="space-y-3 pt-6 opacity-30 select-none">
                  <div className="h-3 w-full bg-slate-200 dark:bg-slate-800 rounded"></div>
                  <div className="h-3 w-11/12 bg-slate-200 dark:bg-slate-800 rounded"></div>
                  <div className="h-3 w-full bg-slate-200 dark:bg-slate-800 rounded"></div>
                  <div className="h-3 w-5/6 bg-slate-200 dark:bg-slate-800 rounded"></div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Right Pane: IntelliGrade AI Assistant */}
        <aside className="w-96 sm:w-[450px] shrink-0 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col shadow-[-4px_0_24px_rgba(0,0,0,0.02)] z-20 transition-colors">
          
          {/* Assistant Tabs */}
          <div className="flex px-3 pt-4 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 shrink-0">
            {[
              { id: "ai_insights", icon: BrainCircuit, label: "AI Insights" },
              { id: "rubric", icon: ListChecks, label: "Rubric" },
              { id: "comments", icon: MessageSquare, label: "Comments" }
            ].map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer relative rounded-t-lg ${
                    isActive
                      ? "text-indigo-650 dark:text-indigo-400 bg-white dark:bg-slate-900 shadow-sm border-t border-x border-slate-250 dark:border-slate-800"
                      : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                  }`}
                >
                  <tab.icon className={`w-4 h-4 mr-2 ${isActive ? "text-indigo-650 dark:text-indigo-400" : "text-slate-405 dark:text-slate-500"}`} />
                  {tab.label}
                  {isActive && (
                    <motion.div
                      layoutId="assistantTabIndicator"
                      className="absolute bottom-[-2px] left-0 right-0 h-[2px] bg-indigo-650 dark:bg-indigo-400"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Assistant Content Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar relative">
            <AnimatePresence mode="wait">
              {activeTab === "ai_insights" && (
                <motion.div
                  key="ai_insights"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.18 }}
                  className="space-y-8"
                >
                  {/* Authenticity Flag */}
                  <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl p-5 transition-colors">
                    <div className="flex items-start">
                      <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mt-0.5 mr-3 shrink-0" />
                      <div>
                        <h3 className="font-heading text-sm font-bold text-emerald-900 dark:text-emerald-300">Authenticity Verified</h3>
                        <p className="text-xs text-emerald-700 dark:text-emerald-455 mt-1 leading-relaxed">
                          IntelliGrade detects a <span className="font-bold">{submission.aiScore}% probability</span> of AI generation. This text exhibits natural human variance.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Extracted Viva Questions */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-heading text-sm font-bold text-slate-900 dark:text-white flex items-center">
                        <BrainCircuit className="w-4 h-4 mr-2 text-indigo-655 dark:text-indigo-400" />
                        Suggested Viva Questions
                      </h3>
                      <span className="text-[9px] font-extrabold uppercase tracking-wider bg-indigo-100 dark:bg-indigo-950/50 text-indigo-750 dark:text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-200/50 dark:border-indigo-900/30">
                        Auto-Generated
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      <AnimatePresence initial={false}>
                        {localQuestions.map((q) => (
                          <motion.div 
                            layout
                            key={q.id} 
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            className={`p-4 rounded-xl border transition-all ${
                              q.added 
                                ? "bg-indigo-50/50 dark:bg-indigo-950/25 border-indigo-200 dark:border-indigo-900/50 shadow-sm" 
                                : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-750/50"
                            }`}
                          >
                            <p className="text-sm text-slate-700 dark:text-slate-350 leading-relaxed mb-3">{q.text}</p>
                            {q.marker && (
                              <div className="mb-3.5 p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-250/50 dark:border-slate-800/60 text-[11px] text-slate-500 dark:text-slate-400/90 italic transition-all leading-normal select-text">
                                <span className="font-bold text-[9px] uppercase tracking-wider text-indigo-650 dark:text-indigo-400 block not-italic mb-1 font-heading">
                                  Evidence from Document:
                                </span>
                                "{q.marker}"
                              </div>
                            )}
                            <button 
                              onClick={() => handleToggleQuestion(q.id, q.added)}
                              className={`text-xs font-semibold flex items-center transition-colors cursor-pointer ${
                                q.added ? "text-indigo-650 dark:text-indigo-400 font-bold" : "text-slate-500 dark:text-slate-405 hover:text-indigo-650 dark:hover:text-indigo-400"
                              }`}
                            >
                              {q.added ? (
                                <><CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-500" /> Added to grading sheet</>
                              ) : (
                                <><PlusCircle className="w-3.5 h-3.5 mr-1.5" /> Add to grading sheet</>
                              )}
                            </button>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Key Entities / Summary */}
                  <div className="space-y-3">
                    <h3 className="font-heading text-sm font-bold text-slate-900 dark:text-white">Extracted Entities</h3>
                    <div className="flex flex-wrap gap-2">
                      {submission.entities ? (
                        submission.entities.split(",").map((tag, i) => (
                          <motion.span 
                            whileHover={{ scale: 1.05 }} 
                            key={i} 
                            className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-950 text-slate-650 dark:text-slate-400 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-800 transition-colors cursor-default"
                          >
                            {tag.trim()}
                          </motion.span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-500">No entities extracted.</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "rubric" && (
                <motion.div
                  key="rubric"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.18 }}
                  className="space-y-6"
                >
                  <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-xl flex items-start transition-colors">
                    <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-455 mr-3 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                      Checking checkboxes below will dynamically suggest an academic grade based on rubric completion.
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    {rubricCriteria.map((criteria, i) => (
                      <motion.label 
                        whileHover={{ x: 2 }}
                        key={i} 
                        className="flex items-start cursor-pointer group p-1"
                      >
                        <div className="relative flex items-center justify-center w-5 h-5 mr-3 mt-0.5">
                          <input 
                            type="checkbox" 
                            checked={checkedCriteria[i]} 
                            onChange={() => handleCheckboxChange(i)} 
                            className="peer sr-only" 
                          />
                          <div className="w-5 h-5 border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 rounded peer-checked:bg-indigo-650 peer-checked:border-indigo-650 dark:peer-checked:bg-indigo-500 dark:peer-checked:border-indigo-500 transition-colors"></div>
                          <CheckCircle2 className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                        </div>
                        <span className="text-sm text-slate-700 dark:text-slate-350 group-hover:text-slate-900 dark:group-hover:text-white transition-colors leading-tight">
                          {criteria}
                        </span>
                      </motion.label>
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
                  className="flex flex-col h-full min-h-60 justify-center items-center text-center p-4"
                >
                  <MessageSquare className="w-10 h-10 text-slate-400 dark:text-slate-655 mb-3" />
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">No comments yet</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed max-w-64">Highlight text in the document mockup to add a contextual comment.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </aside>
      </main>
    </div>
  );
}
