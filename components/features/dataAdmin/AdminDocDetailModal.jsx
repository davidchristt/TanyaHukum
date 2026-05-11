"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AdminDocDetailModal({ item, onClose, onEdit, onDelete }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleEsc);
    return () => { setMounted(false); document.removeEventListener('keydown', handleEsc); };
  }, [onClose]);

  if (!item || !mounted) return null;

  const fileName = item.fileName || item.dokumen || item.title || "";
  const ext = fileName.split('.').pop()?.toUpperCase() || "DOC";
  const formattedDate = item.createdAt
    ? new Date(item.createdAt).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : "—";

  // Admin open: uses GET only, no PATCH (no viewCount increment)
  const handleOpenDoc = () => {
    if (item.fileUrl) window.open(item.fileUrl, '_blank');
  };

  // Admin download: direct link, no analytics increment
  const handleDownload = () => {
    if (item.fileUrl) {
      const a = document.createElement('a');
      a.href = item.fileUrl;
      a.download = fileName;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/30 backdrop-blur-md animate-fadeIn p-4" onClick={onClose}>
      <div className="bg-white rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] w-full max-w-[750px] overflow-hidden transform transition-all animate-slideUp" onClick={(e) => e.stopPropagation()}>

        {/* HEADER */}
        <div className="bg-gray-50/50 px-8 py-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100 shrink-0">
              <span className="text-[10px] font-black text-blue-600 uppercase">{ext}</span>
            </div>
            <div className="min-w-0">
              <h2 className="text-xl font-black text-gray-900 tracking-tight truncate max-w-[450px]">{item.dokumen || item.title}</h2>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Admin Preview · View Count Protected</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2.5 hover:bg-gray-100 rounded-xl transition shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* LEFT: Document Information */}
            <div className="space-y-5">
              <div>
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Informasi Dokumen</h3>
                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Doc ID</span>
                    <span className="text-[10px] font-bold text-gray-700 font-mono">{item.id?.slice(-8) || "—"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Kategori</span>
                    <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 uppercase">{item.category || "—"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ukuran</span>
                    <span className="text-[10px] font-bold text-gray-700">{formatFileSize(item.fileSize)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Format</span>
                    <span className="text-[10px] font-bold text-gray-700">{ext}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tanggal Upload</span>
                    <span className="text-[10px] font-bold text-gray-700">{formattedDate}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              {item.deskripsi && (
                <div>
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Deskripsi</h3>
                  <p className="text-xs font-medium text-gray-600 leading-relaxed bg-gray-50 rounded-xl p-4 border border-gray-100">{item.deskripsi}</p>
                </div>
              )}
            </div>

            {/* RIGHT: Analytics + Actions */}
            <div className="space-y-5">
              <div>
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Analitik Engagement</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100 text-center">
                    <p className="text-2xl font-black text-blue-600">{(item.viewCount || 0).toLocaleString()}</p>
                    <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest mt-1">Total Views</p>
                  </div>
                  <div className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-100 text-center">
                    <p className="text-2xl font-black text-emerald-600">{item.viewCount > 50 ? "Popular" : item.viewCount > 10 ? "Active" : "Low"}</p>
                    <p className="text-[8px] font-black text-emerald-400 uppercase tracking-widest mt-1">Status</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div>
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Aksi Admin</h3>
                <div className="space-y-2">
                  <button onClick={handleOpenDoc} className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition shadow-lg shadow-blue-100 active:scale-95">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                    Buka Dokumen
                  </button>
                  <button onClick={handleDownload} className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-gray-900 text-white font-bold text-xs hover:bg-black transition shadow-lg active:scale-95">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                    Download File
                  </button>
                  {onEdit && (
                    <button onClick={() => { onClose(); onEdit(); }} className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-gray-50 text-gray-600 font-bold text-xs border border-gray-100 hover:bg-gray-100 transition active:scale-95">
                      <img src="/icons/edit.svg" alt="Edit" className="w-4 h-4 opacity-60" />
                      Edit Metadata
                    </button>
                  )}
                  {onDelete && (
                    <button onClick={() => { onClose(); onDelete(); }} className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-red-50 text-red-500 font-bold text-xs border border-red-100 hover:bg-red-100 transition active:scale-95">
                      <img src="/icons/hapus.svg" alt="Hapus" className="w-4 h-4 opacity-60" />
                      Hapus Dokumen
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
