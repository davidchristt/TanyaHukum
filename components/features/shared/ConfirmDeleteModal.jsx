"use client";

import { createPortal } from "react-dom";

export default function ConfirmDeleteModal({ isOpen, onClose, onConfirm, title, message, isProcessing }) {
  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fadeIn" 
        onClick={!isProcessing ? onClose : undefined} 
      />
      <div className="relative bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-sm shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] animate-slideUp border border-transparent dark:border-slate-800 transition-colors">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-900/30 flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
              <path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
            </svg>
          </div>
          <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tight leading-tight">{title || "Hapus Item?"}</h3>
        </div>
        
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed mb-6">
          {message || "Apakah Anda yakin ingin menghapus item ini? Tindakan ini tidak dapat dibatalkan."}
        </p>

        <div className="flex gap-3">
          <button 
            onClick={onClose} 
            disabled={isProcessing}
            className="flex-1 px-4 py-3 bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-gray-400 rounded-xl font-bold hover:bg-gray-100 dark:hover:bg-slate-700 transition-all text-xs uppercase tracking-widest disabled:opacity-50"
          >
            Batal
          </button>
          <button 
            onClick={onConfirm} 
            disabled={isProcessing}
            className="flex-1 px-4 py-3 bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 rounded-xl font-bold hover:bg-red-100 dark:hover:bg-red-900/30 transition-all border border-red-100 dark:border-red-900/30 shadow-sm text-xs uppercase tracking-widest flex items-center justify-center disabled:opacity-50"
          >
            {isProcessing ? (
              <div className="w-4 h-4 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin"></div>
            ) : (
              "Ya, Hapus"
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
