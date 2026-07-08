"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, FileType, CheckCircle2, AlertCircle, X, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function StudentUploadPage() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  
  // State Management
  const [submissionType, setSubmissionType] = useState("it_report");
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadState, setUploadState] = useState("idle"); // 'idle' | 'uploading' | 'success' | 'error'
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  // Drag and Drop Handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      validateAndSetFile(droppedFile);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      validateAndSetFile(selectedFile);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    // Only accept PDFs for this MVP
    if (selectedFile.type !== "application/pdf") {
      setUploadState("error");
      setTimeout(() => setUploadState("idle"), 3000);
      return;
    }
    setFile(selectedFile);
    setUploadState("idle");
    setProgress(0);
  };

  const removeFile = () => {
    setFile(null);
    setUploadState("idle");
    setProgress(0);
    setErrorMessage("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Real Upload & Evaluation Process
  const handleUpload = async () => {
    if (!file) return;
    
    setUploadState("uploading");
    setProgress(15);
    setErrorMessage("");
    
    try {
      // 1. Post multipart file to upload route
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", submissionType);
      
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      
      if (!uploadRes.ok) {
        const uploadErr = await uploadRes.json();
        throw new Error(uploadErr.error || "File upload failed");
      }
      
      const uploadData = await uploadRes.json();
      setProgress(60); // File uploaded, now starting AI review
      
      // 2. Post to evaluate route
      const evaluateRes = await fetch("/api/evaluate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ submissionId: uploadData.submissionId }),
      });
      
      if (!evaluateRes.ok) {
        const evalErr = await evaluateRes.json();
        throw new Error(evalErr.error || "AI evaluation failed");
      }
      
      setProgress(100);
      setUploadState("success");
      
      // Redirect back to student dashboard after a brief delay
      setTimeout(() => {
        router.push("/student");
      }, 2000);
    } catch (err) {
      console.error("Submission failed:", err);
      setErrorMessage(err.message);
      setUploadState("error");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 sm:p-8 space-y-6 sm:space-y-8 bg-transparent text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div>
        <Link 
          href="/student" 
          className="inline-flex items-center text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-primary transition-colors mb-4 group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-0.5 transition-transform" />
          Back to Dashboard
        </Link>
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Document Submission</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-semibold">Upload your academic documents for secure routing and AI analysis.</p>
      </div>

      <div className="glass-panel rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8 space-y-8">
          
          {/* Document Type Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-3 tracking-tight uppercase">
              1. Select Submission Type
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { id: "it_report", label: "IT Report (SIWES)" },
                { id: "project_proposal", label: "Project Proposal" },
                { id: "assignment", label: "Course Assignment" }
              ].map((type) => (
                <motion.button
                  key={type.id}
                  type="button"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setSubmissionType(type.id)}
                  className={`px-4 py-3.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                    submissionType === type.id
                      ? "bg-primary-light border-primary text-primary shadow-sm"
                      : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800/80 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900/50"
                  }`}
                >
                  {type.label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Drag & Drop Zone */}
          <div>
            <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 tracking-tight">
              2. Upload PDF Document
            </label>
            
            <AnimatePresence mode="wait">
              {!file ? (
                <motion.div
                  key="dropzone"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200 ${
                    isDragging 
                      ? "border-primary bg-primary-light" 
                      : uploadState === "error"
                        ? "border-danger-border bg-danger-bg"
                        : "border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 hover:bg-slate-100/50 dark:hover:bg-slate-950/80 hover:border-slate-400 dark:hover:border-slate-700"
                  }`}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileSelect} 
                    accept=".pdf,application/pdf" 
                    className="hidden" 
                  />
                  
                  {uploadState === "error" ? (
                    <div className="text-center p-6">
                      <AlertCircle className="w-10 h-10 text-danger mx-auto mb-3" />
                      <p className="text-sm font-bold text-danger">Invalid File Type</p>
                      <p className="text-xs text-danger/80 mt-1 font-semibold">Please upload a valid PDF document.</p>
                    </div>
                  ) : (
                    <div className="text-center p-6">
                      <div className={`p-4 rounded-full mx-auto mb-4 w-fit transition-colors shadow-inner ${isDragging ? "bg-primary-light text-primary" : "bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 shadow-sm"}`}>
                        <UploadCloud className="w-8 h-8" />
                      </div>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">PDF files only (Max 50MB)</p>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="file-preview"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 bg-white dark:bg-slate-955 shadow-sm transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-primary-light text-primary rounded-xl flex-shrink-0 shadow-inner">
                        <FileType className="w-8 h-8" />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-semibold">
                          {(file.size / (1024 * 1024)).toFixed(2)} MB • PDF Document
                        </p>
                      </div>
                    </div>
                    {uploadState === "idle" && (
                      <motion.button 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={removeFile}
                        className="p-2 text-slate-400 dark:text-slate-500 hover:text-danger hover:bg-danger-bg rounded-lg transition-colors cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </motion.button>
                    )}
                  </div>

                  {/* Upload Progress Bar or Error */}
                  {uploadState === "uploading" && (
                    <div className="mt-6">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Analyzing and routing to lecturer...
                        </span>
                        <span className="text-xs font-bold text-primary">{progress}%</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-full h-2 overflow-hidden shadow-inner">
                        <motion.div 
                          className="h-2 rounded-full bg-primary"
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ ease: "easeInOut" }}
                        />
                      </div>
                    </div>
                  )}

                  {uploadState === "success" && (
                    <div className="mt-6">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-350">
                          Submission Complete
                        </span>
                        <span className="text-xs font-bold text-primary">{progress}%</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-full h-2 overflow-hidden shadow-inner">
                        <motion.div 
                          className="h-2 rounded-full bg-success"
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ ease: "easeInOut" }}
                        />
                      </div>
                    </div>
                  )}

                  {uploadState === "error" && (
                    <div className="mt-6 p-4 bg-danger-bg border border-danger-border rounded-xl animate-fade-in">
                      <div className="flex items-start">
                        <AlertCircle className="w-5 h-5 text-danger mt-0.5 mr-3 shrink-0" />
                        <div>
                          <p className="text-sm font-bold text-danger">AI Evaluation Failed</p>
                          <p className="text-xs text-danger/80 mt-1 leading-relaxed font-semibold">
                            {errorMessage || "An error occurred during evaluation. Please try again."}
                          </p>
                          <button 
                            onClick={removeFile}
                            className="mt-3 text-xs font-bold text-danger hover:underline cursor-pointer"
                          >
                            Dismiss and try again
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-950/40 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between transition-colors">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center select-none">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-success" />
            End-to-end encrypted
          </p>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <button
              onClick={handleUpload}
              disabled={!file || uploadState !== "idle"}
              className="inline-flex items-center justify-center px-6 py-2.5 text-xs font-bold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none transition-all cursor-pointer uppercase tracking-wider"
            >
              {uploadState === "uploading" ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : uploadState === "success" ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Submitted
                </>
              ) : (
                "Submit Document"
              )}
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}