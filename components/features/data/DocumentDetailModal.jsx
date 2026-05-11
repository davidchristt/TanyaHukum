"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";

export default function DocumentDetailModal({ isOpen, onClose, document: doc, onIncrementView }) {
  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen || !doc) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-[12000] flex items-center justify-center bg-slate-900/20 backdrop-blur-md animate-in fade-in duration-300 p-4"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-white rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] overflow-hidden transform transition-all animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Image/Pattern Area */}
        <div className="relative">
          <div className="h-32 bg-gray-50 relative overflow-hidden">
            <div className="absolute inset-0 bg-blue-500/5 blur-[40px] rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute top-6 right-6">
              <button 
                onClick={onClose}
                className="bg-white/80 hover:bg-white text-gray-400 hover:text-gray-900 p-2 rounded-full transition-all active:scale-90 border border-gray-100 shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
          </div>
          
          {/* Overlapping Icon - Placed outside overflow-hidden to prevent clipping */}
          <div className="absolute bottom-0 left-10 translate-y-1/2 z-20">
            <div className="w-20 h-20 bg-blue-600 text-white rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-900/20 border-4 border-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            </div>
          </div>
        </div>

        <div className="px-10 pt-14 pb-10 space-y-8">
          {/* Main Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-blue-100">
                {doc.category || "Legal Document"}
              </span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Regulasi Tervalidasi</span>
            </div>
            <h2 className="text-3xl font-black text-gray-900 leading-tight">
              {doc.title}
            </h2>
          </div>

          {/* Description Block */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">Ringkasan Dokumen</h4>
            <p className="text-gray-500 leading-relaxed font-medium">
              {doc.description || "Dokumen hukum resmi yang mengatur tentang subjek terkait. Informasi ini telah diverifikasi dan merupakan bagian dari pusat data hukum nasional."}
            </p>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</p>
              <p className="text-sm font-bold text-gray-900">Berlaku</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Referen ID</p>
              <p className="text-sm font-bold text-gray-900">#{doc.id?.substring(0, 12) || "N/A"}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Dilihat</p>
              <p className="text-sm font-bold text-gray-900">{doc.viewCount?.toLocaleString() || "0"} Kali</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 pt-4">
            <button 
              onClick={() => {
                onIncrementView?.(doc.id, 'read');
                window.open(doc.fileUrl, '_blank');
              }}
              className="flex-1 py-4 bg-gray-900 hover:bg-black text-white font-bold rounded-2xl shadow-xl shadow-gray-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              Baca Sekarang
            </button>
            <button 
              onClick={() => {
                onIncrementView?.(doc.id, 'download');
                const downloadUrl = doc.fileUrl.includes('?') ? `${doc.fileUrl}&download=` : `${doc.fileUrl}?download=`;
                const link = document.createElement("a");
                link.href = downloadUrl;
                link.setAttribute("download", "");
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              className="px-6 py-4 border-2 border-gray-100 hover:border-blue-200 text-gray-500 hover:text-blue-600 rounded-2xl transition-all active:scale-[0.98]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
