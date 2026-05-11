"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

export default function AdminIssueDetailModal({ item, onClose, onDelete }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleEsc);
    return () => { setMounted(false); document.removeEventListener('keydown', handleEsc); };
  }, [onClose]);

  if (!item || !mounted) return null;

  const publishDate = item.publishDate || item.createdAt;
  const formattedDate = publishDate
    ? new Date(publishDate).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : "—";

  const relativeTime = (() => {
    if (!publishDate) return "";
    const diff = Date.now() - new Date(publishDate).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (days > 0) return `${days} hari lalu`;
    if (hours > 0) return `${hours} jam lalu`;
    if (mins > 0) return `${mins} menit lalu`;
    return "Baru saja";
  })();

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/30 backdrop-blur-md animate-fadeIn p-4" onClick={onClose}>
      <div className="bg-white rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] w-full max-w-[550px] overflow-hidden transform transition-all animate-slideUp" onClick={(e) => e.stopPropagation()}>

        {/* HEADER */}
        <div className="bg-gray-50/50 px-8 py-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-5 bg-blue-600 rounded-full" />
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Detail Isu Terkini</span>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight leading-tight">{item.title}</h2>
          <div className="flex items-center gap-3 mt-3 flex-wrap">
            <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 uppercase tracking-tight">
              {item.isActive !== false ? "Published" : "Draft"}
            </span>
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{relativeTime}</span>
          </div>
        </div>

        {/* BODY */}
        <div className="p-8 space-y-6">

          {/* Description */}
          <div>
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Deskripsi</h3>
            <p className="text-sm font-medium text-gray-700 leading-relaxed">{item.desc || item.description || "Tidak ada deskripsi."}</p>
          </div>

          {/* Metadata Grid */}
          <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tanggal Publish</span>
              <span className="text-[10px] font-bold text-gray-700">{formattedDate}</span>
            </div>
            {(item.location) && (
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Lokasi</span>
                <span className="text-[10px] font-bold text-gray-700">{item.location}</span>
              </div>
            )}
            {(item.link || item.newsLink) && (
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sumber</span>
                <a href={item.link || item.newsLink} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-blue-600 hover:underline truncate max-w-[200px]">
                  {item.link || item.newsLink}
                </a>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Issue ID</span>
              <span className="text-[10px] font-bold text-gray-500 font-mono">{item.id?.slice(-8) || "—"}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 bg-gray-50 text-gray-400 font-bold py-3.5 rounded-xl hover:bg-gray-100 transition active:scale-95 text-[10px] uppercase tracking-widest">
              Tutup
            </button>
            {onDelete && (
              <button onClick={() => { onClose(); onDelete(); }} className="flex-1 bg-red-50 text-red-500 font-bold py-3.5 rounded-xl border border-red-100 hover:bg-red-100 transition active:scale-95 text-[10px] uppercase tracking-widest">
                Hapus Isu
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
