"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Download, Maximize2, ZoomIn, ZoomOut, BrainCircuit, ListChecks, MessageSquare, ShieldCheck, PlusCircle, CheckCircle2, AlertCircle 
} from "lucide-react";
import { toggleVivaQuestionAction, submitGradeAction, createCommentAction, deleteCommentAction } from "@/app/actions/grading";
import { toast } from "sonner";
import CommentCard from "@/components/CommentCard";
import dynamic from "next/dynamic";

// Strict SSR isolation: The server will never attempt to parse or render this component
const PdfViewer = dynamic(() => import("@/components/PdfViewer"), {
  ssr: false,
  loading: () => (
    <div className="animate-pulse flex space-x-4 p-12 w-full justify-center">
      <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded w-64"></div>
    </div>
  ),
});

export default function ReviewWorkspaceClient({ submission, vivaQuestions, rubricCriteria }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("ai_insights");
  const [zoom, setZoom] = useState(100);
  const [grade, setGrade] = useState(submission.humanScore !== null ? submission.humanScore : "");
  const [localQuestions, setLocalQuestions] = useState(vivaQuestions);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState("reader"); 
  
  const [localComments, setLocalComments] = useState(submission.comments || []);
  const [selectedText, setSelectedText] = useState("");
  const [newCommentText, setNewCommentText] = useState("");
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipCoords, setTooltipCoords] = useState({ x: 0, y: 0 });

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (!selection) return;
    const text = selection.toString().trim();
    if (text.length > 0) {
      setSelectedText(text);
      try {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setTooltipCoords({
          x: rect.left + rect.width / 2,
          y: rect.top + window.scrollY - 40
        });
        setShowTooltip(true);
      } catch (err) {
        console.error("Error setting selection tooltip coords:", err);
      }
    } else {
      setShowTooltip(false);
    }
  };

  useEffect(() => {
    const handleDocumentClick = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) setShowTooltip(false);
    };
    document.addEventListener("mousedown", handleDocumentClick);
    return () => document.removeEventListener("mousedown", handleDocumentClick);
  }, []);

  const handleSaveComment = async () => {
    if (!newCommentText.trim()) return toast.error("Comment text cannot be empty.");
    const result = await createCommentAction(submission.id, selectedText, newCommentText);
    if (result.error) return toast.error(result.error);
    
    toast.success("Comment added successfully!");
    setLocalComments(prev => [...prev, {
      id: result.comment.id, text: result.comment.text, quote: result.comment.quote, date: result.comment.createdAt
    }]);
    setSelectedText(""); setNewCommentText(""); router.refresh();
  };

  const handleDeleteComment = async (commentId) => {
    setLocalComments(prev => prev.filter(c => c.id !== commentId));
    const result = await deleteCommentAction(commentId, submission.id);
    if (result.error) { toast.error(result.error); router.refresh(); } 
    else { toast.success("Comment deleted successfully."); router.refresh(); }
  };

  const normalizedCriteria = rubricCriteria.map((item) => {
    if (typeof item === "string") return { text: item, points: 10 };
    return { text: item.text || "", points: typeof item.points === "number" ? item.points : 10 };
  });
  
  const [checkedCriteria, setCheckedCriteria] = useState(new Array(normalizedCriteria.length).fill(false));

  const handleCheckboxChange = (index) => {
    const updated = [...checkedCriteria];
    updated[index] = !updated[index];
    setCheckedCriteria(updated);

    const positiveMax = normalizedCriteria.filter((c) => c.points > 0).reduce((sum, c) => sum + c.points, 0);
    const baseScore = normalizedCriteria.some((c) => c.points > 0) ? 0 : 100;
    let currentScore = baseScore;
    updated.forEach((checked, i) => { if (checked) currentScore += normalizedCriteria[i].points; });
    
    const recommendation = positiveMax > 0 ? Math.round((currentScore / positiveMax) * 100) : currentScore;
    setGrade(Math.max(0, Math.min(100, recommendation)));
  };

  const handleToggleQuestion = async (id, currentAdded) => {
    setLocalQuestions(prev => prev.map(q => q.id === id ? { ...q, added: !currentAdded } : q));
    const result = await toggleVivaQuestionAction(id, !currentAdded);
    if (result.error) {
      setLocalQuestions(prev => prev.map(q => q.id === id ? { ...q, added: currentAdded } : q));
      toast.error(result.error);
    } else {
      toast.success(!currentAdded ? "Question added to grading sheet" : "Question removed");
    }
  };

  const handleSaveDraft = async () => {
    if (grade === "") return toast.error("Please enter a grade score before saving draft.");
    setIsSubmitting(true);
    const result = await submitGradeAction(submission.id, grade, "needs_grading");
    setIsSubmitting(false);
    if (result.error) toast.error(result.error);
    else toast.success("Draft saved successfully!");
  };

  const handleSubmitFinalGrade = async () => {
    if (grade === "") return toast.error("Please enter a final grade percentage.");
    setIsSubmitting(true);
    const result = await submitGradeAction(submission.id, grade, "graded");
    setIsSubmitting(false);
    if (result.error) toast.error(result.error);
    else {
      toast.success("Final grade submitted! Submission completed.");
      router.push("/lecturer");
      router.refresh();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-955 text-slate-900 dark:text-slate-100 transition-colors duration-300 overflow-hidden relative">
      <header className="h-16 border-b border-slate-200/60 dark:border-slate-800/80 bg-slate-950 flex items-center justify-between px-6 shrink-0 z-10 shadow-md">
        <div className="flex items-center space-x-6">
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link href="/lecturer" className="flex items-center text-sm font-semibold text-slate-300 dark:text-slate-400 hover:text-primary transition-colors bg-slate-900/60 dark:bg-slate-900/60 px-3.5 py-2 rounded-xl border border-slate-800 dark:border-slate-805 shadow-sm">
              <ArrowLeft className="w-4 h-4 mr-2" /> Exit Workspace
            </Link>
          </motion.div>
          <div className="h-6 w-px bg-slate-800"></div>
          <div>
            <h1 className="font-heading text-sm sm:text-base font-bold text-white leading-tight truncate max-w-[200px] sm:max-w-xs">{submission.docTitle}</h1>
            <p className="text-[11px] text-slate-450 font-semibold mt-0.5">{submission.studentName} • {submission.matricNo}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 space-x-2">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider select-none">Score:</span>
            <input type="number" min="0" max="100" value={grade} onChange={(e) => setGrade(e.target.value)} className="w-12 bg-transparent border-0 text-white font-bold text-center text-sm focus:ring-0 focus:outline-none placeholder-slate-700" placeholder="--" />
            <span className="text-slate-400 font-semibold text-sm select-none">%</span>
          </div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSaveDraft} disabled={isSubmitting} className="inline-flex items-center justify-center px-4 py-2.5 text-xs font-bold text-primary bg-primary-light border border-primary-border rounded-xl hover:bg-primary-light/80 disabled:opacity-50 transition-colors cursor-pointer uppercase tracking-wider">
            Save Draft
          </motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSubmitFinalGrade} disabled={isSubmitting} className="inline-flex items-center justify-center px-4 py-2.5 text-xs font-bold text-white bg-primary rounded-xl hover:bg-primary-hover shadow-sm disabled:opacity-50 transition-all cursor-pointer uppercase tracking-wider">
            Submit Final Grade
          </motion.button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        <section className="flex-1 flex flex-col bg-slate-100/30 dark:bg-slate-900/20 relative overflow-hidden">
          <div className="flex justify-between items-center px-6 py-3 bg-white dark:bg-slate-950 border-b border-slate-200/50 dark:border-slate-800/85 shrink-0 z-10">
            <div className="flex space-x-2">
              <button onClick={() => setViewMode("reader")} className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${viewMode === "reader" ? "bg-primary text-white shadow-sm" : "bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"}`}>
                📖 Document View
              </button>
              <button onClick={() => setViewMode("summary")} className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${viewMode === "summary" ? "bg-primary text-white shadow-sm" : "bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"}`}>
                📝 AI Summary & Details
              </button>
            </div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {viewMode === "reader" ? "Interactive PDF Reader" : "Generated Academic Insights"}
            </span>
          </div>

          {viewMode === "reader" && (
            <motion.div initial={{ y: 50, x: "-50%", opacity: 0 }} animate={{ y: 0, x: "-50%", opacity: 1 }} transition={{ type: "spring", stiffness: 100, damping: 15 }} className="absolute bottom-6 left-1/2 flex items-center bg-slate-900/90 text-white px-5 py-2.5 rounded-full shadow-2xl space-x-4.5 z-10 backdrop-blur-md border border-slate-700/60">
              <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.85 }} className="p-1 hover:bg-slate-800 rounded-md transition-colors cursor-pointer" onClick={() => setZoom(z => Math.max(50, z - 10))}><ZoomOut className="w-4 h-4" /></motion.button>
              <span className="text-xs sm:text-sm font-bold min-w-12 text-center select-none">{zoom}%</span>
              <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.85 }} className="p-1 hover:bg-slate-800 rounded-md transition-colors cursor-pointer" onClick={() => setZoom(z => Math.min(200, z + 10))}><ZoomIn className="w-4 h-4" /></motion.button>
              <div className="w-px h-4 bg-slate-700"></div>
              <a href={submission.filePath} download className="p-1 hover:bg-slate-800 rounded-md text-white transition-colors cursor-pointer"><Download className="w-4 h-4" /></a>
            </motion.div>
          )}

          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-200/50 dark:bg-slate-900/50" onMouseUp={handleTextSelection} onKeyUp={handleTextSelection}>
            {viewMode === "reader" ? (
              <PdfViewer fileUrl={submission.filePath} zoom={zoom} />
            ) : (
              <div className="bg-white dark:bg-slate-950 mx-auto shadow-xl border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-12 space-y-6 select-text max-w-4xl">
                <div className="border-b pb-6 mb-8 border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-mono uppercase tracking-wider text-primary font-bold">Academic Evaluation Document</span>
                  <h2 className="text-2xl font-bold mt-2 text-slate-850 dark:text-slate-100">{submission.docTitle}</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Submitted by {submission.studentName} on {new Date(submission.date).toLocaleDateString()}</p>
                </div>
                <div className="space-y-4 text-slate-600 dark:text-slate-355 leading-relaxed text-sm">
                  <p className="font-semibold text-slate-900 dark:text-white">Document Summary:</p>
                  <p className="whitespace-pre-line">{submission.summary || "No academic summary generated for this document."}</p>
                  <div className="p-5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-205 dark:border-slate-800 space-y-2 mt-6">
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Document Metadata</p>
                    <div className="grid grid-cols-2 gap-4 text-xs font-medium text-slate-600 dark:text-slate-400">
                      <div>File Path: <code className="bg-slate-100 dark:bg-slate-950 px-1 py-0.5 rounded truncate max-w-[150px] inline-block align-bottom">{submission.filePath}</code></div>
                      <div>File Size: <span className="font-semibold">{submission.fileSize}</span></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        <aside className="w-96 sm:w-[450px] shrink-0 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col shadow-[-4px_0_24px_rgba(0,0,0,0.02)] z-20 transition-colors">
          <div className="flex px-3 pt-4 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 shrink-0">
            {[
              { id: "ai_insights", icon: BrainCircuit, label: "AI Insights" },
              { id: "rubric", icon: ListChecks, label: "Rubric" },
              { id: "comments", icon: MessageSquare, label: "Comments" }
            ].map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer relative rounded-t-lg ${isActive ? "text-primary bg-white dark:bg-slate-900 shadow-sm border-t border-x border-slate-200 dark:border-slate-800" : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"}`}
                >
                  <tab.icon className={`w-4 h-4 mr-2 ${isActive ? "text-primary" : "text-slate-400 dark:text-slate-500"}`} /> {tab.label}
                  {isActive && <motion.div layoutId="assistantTabIndicator" className="absolute bottom-[-2px] left-0 right-0 h-[2px] bg-primary" transition={{ type: "spring", stiffness: 380, damping: 30 }} />}
                </button>
              );
            })}
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar relative">
            <AnimatePresence mode="wait">
              {activeTab === "ai_insights" && (
                <motion.div key="ai_insights" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.18 }} className="space-y-8">
                  <div className="bg-success-bg border border-success-border rounded-xl p-5 transition-colors">
                    <div className="flex items-start">
                      <ShieldCheck className="w-6 h-6 text-success mt-0.5 mr-3 shrink-0" />
                      <div>
                        <h3 className="font-heading text-sm font-bold text-slate-900 dark:text-white">Authenticity Verified</h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                          IntelliGrade detects a <span className="font-bold">{submission.aiScore}% probability</span> of AI generation.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-heading text-sm font-bold text-slate-900 dark:text-white flex items-center"><BrainCircuit className="w-4 h-4 mr-2 text-primary" /> Suggested Viva Questions</h3>
                      <span className="text-[9px] font-extrabold uppercase tracking-wider bg-primary-light text-primary px-2 py-0.5 rounded-full border border-primary-border">Auto-Generated</span>
                    </div>
                    
                    <div className="space-y-3">
                      <AnimatePresence initial={false}>
                        {localQuestions.map((q) => (
                          <motion.div layout key={q.id} id={`viva-card-${q.id}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className={`p-4 rounded-xl border transition-all ${q.added ? "bg-primary-light/50 border-primary-border shadow-sm" : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"}`}>
                            <p className="text-sm text-slate-700 dark:text-slate-350 leading-relaxed mb-3">{q.text}</p>
                            {q.marker && (
                              <div className="mb-3.5 p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 italic leading-normal select-text">
                                <span className="font-bold text-[9px] uppercase tracking-wider text-primary block not-italic mb-1 font-heading">Evidence from Document:</span>&quot;{q.marker}&quot;
                              </div>
                            )}
                            <button onClick={() => handleToggleQuestion(q.id, q.added)} className={`text-xs font-semibold flex items-center transition-colors cursor-pointer ${q.added ? "text-primary font-bold" : "text-slate-500 dark:text-slate-400 hover:text-primary"}`}>
                              {q.added ? <><CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-500" /> Added to grading sheet</> : <><PlusCircle className="w-3.5 h-3.5 mr-1.5" /> Add to grading sheet</>}
                            </button>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-heading text-sm font-bold text-slate-900 dark:text-white">Extracted Entities</h3>
                    <div className="flex flex-wrap gap-2">
                      {submission.entities ? submission.entities.split(",").map((tag, i) => (
                        <span key={i} className="px-2.5 py-1.5 bg-slate-105 dark:bg-slate-900 text-slate-600 dark:text-slate-400 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-800/40">{tag.trim()}</span>
                      )) : <span className="text-xs text-slate-500">No entities extracted.</span>}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "rubric" && (
                <motion.div key="rubric" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                  <div className="p-4 bg-warning-bg border border-warning-border rounded-xl flex items-start transition-colors">
                    <AlertCircle className="w-5 h-5 text-warning mr-3 shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-semibold">Checking checkboxes below will dynamically suggest an academic grade based on rubric completion.</p>
                  </div>
                  
                  <div className="space-y-4">
                    {normalizedCriteria.map((crit, i) => (
                      <motion.label whileHover={{ x: 2 }} key={i} className="flex items-start cursor-pointer group p-1">
                        <div className="relative flex items-center justify-center w-5 h-5 mr-3 mt-0.5 shrink-0">
                          <input type="checkbox" checked={checkedCriteria[i]} onChange={() => handleCheckboxChange(i)} className="peer sr-only" />
                          <div className="w-5 h-5 border-2 border-slate-300 dark:bg-slate-950 rounded peer-checked:bg-primary transition-colors"></div>
                          <CheckCircle2 className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                        </div>
                        <div className="flex-1 flex justify-between items-start gap-4">
                          <span className="text-sm text-slate-700 dark:text-slate-350">{crit.text}</span>
                          <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md border shrink-0 ${crit.points > 0 ? "bg-success-bg text-success" : "bg-danger-bg text-danger"}`}>
                            {crit.points > 0 ? `+${crit.points} pts` : `${crit.points} pts`}
                          </span>
                        </div>
                      </motion.label>
                    ))}
                  </div>
                </motion.div>
              )}
              
              {activeTab === "comments" && (
                <motion.div key="comments" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6 w-full text-left">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-heading text-sm font-bold text-slate-900 dark:text-white flex items-center"><MessageSquare className="w-4 h-4 mr-2 text-primary" /> Lecturer Annotations</h3>
                    <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">{localComments.length} comments</span>
                  </div>

                  {selectedText ? (
                    <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-primary-border relative shadow-sm">
                      <span className="text-[9px] font-extrabold text-primary block mb-1.5 uppercase tracking-wider">Adding Feedback on:</span>
                      <blockquote className="text-xs italic text-slate-600 dark:text-slate-400 border-l-2 border-primary-border pl-2.5 py-1 mb-3.5 bg-white dark:bg-slate-900 rounded-r max-h-24 overflow-y-auto select-text leading-relaxed">
                        &quot;{selectedText}&quot;
                      </blockquote>
                      <textarea placeholder="Type feedback notes..." rows={3} value={newCommentText} onChange={(e) => setNewCommentText(e.target.value)} className="w-full text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary-border resize-none" id="comment-input-textarea" />
                      <div className="flex justify-end space-x-2 mt-3">
                        <button onClick={() => { setSelectedText(""); setNewCommentText(""); }} className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 cursor-pointer">Cancel</button>
                        <button onClick={handleSaveComment} className="bg-primary hover:bg-primary-hover text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer">Save Comment</button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-primary-light border border-primary-border rounded-xl text-xs text-slate-700 font-semibold">
                      💡 <strong>Tip:</strong> Highlight any text inside the Document View to add a remote feedback comment.
                    </div>
                  )}

                  {localComments.length > 0 ? (
                    <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
                      {localComments.map((c) => <CommentCard key={c.id} comment={c} onDelete={handleDeleteComment} />)}
                    </div>
                  ) : !selectedText ? (
                    <div className="flex flex-col h-full min-h-60 justify-center items-center text-center p-4">
                      <MessageSquare className="w-10 h-10 text-slate-400 mb-3" />
                      <p className="text-sm font-semibold">No comments yet</p>
                      <p className="text-xs text-slate-500 mt-1 max-w-64">Highlight text in the document reader to add contextual comments.</p>
                    </div>
                  ) : null}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </aside>
      </main>

      {showTooltip && (
        <button
          style={{ position: "fixed", left: `${tooltipCoords.x}px`, top: `${tooltipCoords.y}px`, transform: "translateX(-50%)", zIndex: 9999 }}
          onClick={() => { setActiveTab("comments"); setShowTooltip(false); setTimeout(() => { document.getElementById("comment-input-textarea")?.focus(); }, 100); }}
          className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg border border-primary-border flex items-center space-x-1.5 cursor-pointer"
        >
          <MessageSquare className="w-3.5 h-3.5" /> <span>Add Comment</span>
        </button>
      )}
    </div>
  );
}