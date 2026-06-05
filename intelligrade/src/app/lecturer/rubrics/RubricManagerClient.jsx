"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ListChecks, MoreVertical, Edit2, X, Save } from "lucide-react";
import { createRubricAction, updateRubricAction } from "@/app/actions/rubrics";
import { toast } from "sonner";

export default function RubricManagerClient({ initialRubrics }) {
  const [rubrics, setRubrics] = useState(initialRubrics);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRubric, setEditingRubric] = useState({ title: "", criteriaCount: 4, criteriaList: [] });
  const [isEditingExisting, setIsEditingExisting] = useState(false);
  const [loading, setLoading] = useState(false);

  const openCreateModal = () => {
    setEditingRubric({ title: "", criteriaCount: 4, criteriaList: ["", "", "", ""] });
    setIsEditingExisting(false);
    setIsModalOpen(true);
  };

  const openEditModal = (rubric) => {
    setEditingRubric({
      id: rubric.id,
      title: rubric.title,
      criteriaCount: rubric.criteriaCount,
      criteriaList: Array.isArray(rubric.criteriaList) ? rubric.criteriaList : []
    });
    setIsEditingExisting(true);
    setIsModalOpen(true);
  };

  const handleCriteriaChange = (index, value) => {
    const list = [...editingRubric.criteriaList];
    list[index] = value;
    setEditingRubric({ ...editingRubric, criteriaList: list });
  };

  const handleCriteriaCountChange = (count) => {
    const newCount = Math.max(1, Math.min(20, count));
    const list = [...editingRubric.criteriaList];
    
    if (list.length < newCount) {
      while (list.length < newCount) {
        list.push("");
      }
    } else if (list.length > newCount) {
      list.splice(newCount);
    }

    setEditingRubric({ ...editingRubric, criteriaCount: newCount, criteriaList: list });
  };

  const handleSave = async () => {
    if (!editingRubric.title.trim()) {
      toast.error("Please provide a rubric title.");
      return;
    }

    const emptyFilter = editingRubric.criteriaList.filter(c => c.trim() !== "");
    if (emptyFilter.length === 0) {
      toast.error("Please provide at least one evaluation criteria description.");
      return;
    }

    setLoading(true);

    if (isEditingExisting) {
      const res = await updateRubricAction(
        editingRubric.id,
        editingRubric.title,
        editingRubric.criteriaCount,
        emptyFilter
      );
      setLoading(false);

      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Rubric updated successfully!");
        setRubrics(rubrics.map(r => r.id === editingRubric.id ? {
          ...editingRubric,
          criteriaCount: emptyFilter.length,
          criteriaList: emptyFilter,
          lastUpdated: "Just now"
        } : r));
        setIsModalOpen(false);
      }
    } else {
      const res = await createRubricAction(
        editingRubric.title,
        editingRubric.criteriaCount,
        emptyFilter
      );
      setLoading(false);

      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("New rubric created successfully!");
        const newRubric = {
          id: res.rubric.id,
          title: res.rubric.title,
          criteriaCount: res.rubric.criteriaCount,
          criteriaList: emptyFilter,
          lastUpdated: "Just now"
        };
        setRubrics([newRubric, ...rubrics]);
        setIsModalOpen(false);
      }
    }
  };

  const formatDate = (dateStr) => {
    if (dateStr === "Just now") return dateStr;
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="max-w-6xl mx-auto p-4 sm:p-8 space-y-8 relative bg-transparent text-slate-900 dark:text-slate-100"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Rubric Manager</h1>
          <p className="text-sm sm:text-base text-slate-550 dark:text-slate-405 mt-1 font-medium">Configure grading criteria for the CS Department.</p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={openCreateModal}
          className="inline-flex items-center justify-center px-4 py-2.5 bg-indigo-650 dark:bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 dark:hover:bg-indigo-550 shadow-md transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4 mr-2" /> Create Rubric
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {rubrics.map((rubric, idx) => (
            <motion.div 
              layout
              key={rubric.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: idx * 0.05, type: "spring", stiffness: 300, damping: 25 }}
              whileHover={{ y: -4 }}
              className="glass-panel p-6 rounded-2xl flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 rounded-xl shadow-inner">
                    <ListChecks className="w-5 h-5" />
                  </div>
                  <button className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-350 cursor-pointer">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
                <h3 className="font-heading text-lg font-bold text-slate-900 dark:text-white mb-1.5 leading-tight">{rubric.title}</h3>
                <p className="text-sm font-semibold text-slate-505 dark:text-slate-400 mb-6">{rubric.criteriaCount} Evaluation Criteria</p>
              </div>
              
              <div className="flex items-center justify-between border-t border-slate-200/50 dark:border-slate-800/80 pt-4 mt-auto">
                <span className="text-xs text-slate-450 dark:text-slate-500 font-medium" suppressHydrationWarning>Updated {formatDate(rubric.lastUpdated)}</span>
                <button 
                  onClick={() => openEditModal(rubric)}
                  className="text-sm font-bold text-indigo-650 dark:text-indigo-400 hover:text-indigo-850 dark:hover:text-indigo-300 flex items-center cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Modal Overlay */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-slate-905/40 backdrop-blur-sm"
            />
            
            {/* Modal Body */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative z-10 max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center justify-between p-5 border-b border-slate-200/50 dark:border-slate-800 shrink-0">
                <h2 className="font-heading text-lg font-bold text-slate-900 dark:text-white">{isEditingExisting ? "Edit Rubric" : "Create New Rubric"}</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-350 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-5 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-450 mb-1.5 uppercase tracking-wider">Rubric Title</label>
                  <input 
                    type="text" 
                    value={editingRubric.title}
                    onChange={(e) => setEditingRubric({...editingRubric, title: e.target.value})}
                    placeholder="e.g., Data Structures Final Project"
                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/50 focus:outline-none text-sm transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-450 mb-1.5 uppercase tracking-wider">Number of Criteria Points</label>
                  <input 
                    type="number" 
                    min="1" max="20"
                    value={editingRubric.criteriaCount}
                    onChange={(e) => handleCriteriaCountChange(parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/50 focus:outline-none text-sm transition-all"
                  />
                </div>

                <div className="space-y-3 pt-2">
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-450 uppercase tracking-wider">Evaluation Checkpoints</label>
                  {editingRubric.criteriaList.map((crit, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-slate-400 w-5">{index + 1}.</span>
                      <input 
                        type="text"
                        value={crit}
                        onChange={(e) => handleCriteriaChange(index, e.target.value)}
                        placeholder={`Criteria checkpoint ${index + 1}`}
                        className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-805 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/50 focus:outline-none text-xs transition-all"
                      />
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="p-5 bg-slate-50 dark:bg-slate-950/40 border-t border-slate-200/50 dark:border-slate-800 flex justify-end gap-3 shrink-0">
                <button onClick={() => setIsModalOpen(false)} className="px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-405 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer">Cancel</button>
                <motion.button 
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSave} 
                  disabled={loading}
                  className="flex items-center px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 dark:bg-indigo-700 hover:bg-indigo-700 dark:hover:bg-indigo-650 rounded-xl shadow-sm disabled:opacity-50 transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4 mr-2" /> {loading ? "Saving..." : "Save Rubric"}
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
