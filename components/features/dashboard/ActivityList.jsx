"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

export default function ActivityList({ issues = [] }) {
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Lock body scroll and handle ESC key
  useEffect(() => {
    if (selectedIssue) {
      document.body.style.overflow = "hidden";
      const handleEsc = (e) => {
        if (e.key === "Escape") setSelectedIssue(null);
      };
      window.addEventListener("keydown", handleEsc);
      return () => {
        document.body.style.overflow = "auto";
        window.removeEventListener("keydown", handleEsc);
      };
    }
  }, [selectedIssue]);

  const getRelativeTime = (dateString) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffInMs = now - past;
    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMins < 60) return `${diffInMins} menit lalu`;
    if (diffInHours < 24) return `${diffInHours} jam lalu`;
    if (diffInDays === 1) return `Kemarin`;
    if (diffInDays < 7) return `${diffInDays} hari lalu`;
    
    return past.toLocaleDateString("id-ID", { day: 'numeric', month: 'short' });
  };

  const getExcerpt = (text, length = 80) => {
    if (!text) return "";
    return text.length > length ? text.substring(0, length) + "..." : text;
  };

  // Helper to clean description from raw URLs (simple regex)
  const cleanDescription = (text) => {
    if (!text) return "";
    return text.replace(/https?:\/\/[^\s]+/g, '').trim();
  };

  const handleShare = async (link) => {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    } catch (err) {
      console.error("Gagal menyalin link:", err);
    }
  };

  const formatDomain = (url) => {
    if (!url) return "Sumber Resmi";
    try {
      const domain = new URL(url).hostname.replace('www.', '');
      return domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1);
    } catch (e) {
      return "Sumber Resmi";
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-slate-800 flex flex-col h-[600px] overflow-hidden group transition-all duration-300 hover:shadow-md">
      
      {/* Header */}
      <div className="p-8 border-b border-gray-50 dark:border-slate-800 bg-gray-50/30 dark:bg-slate-800/30 transition-colors">
        <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-3 tracking-tight transition-colors">
          <div className="w-2 h-7 bg-blue-600 rounded-full" />
          Isu Terkini
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium transition-colors">Insight hukum dan berita terbaru pilihan hari ini</p>
      </div>

      {/* Scrollable Feed */}
      <div className="flex-1 overflow-y-auto custom-scrollbar h-[500px]">
        {issues && issues.length > 0 ? (
          <div className="divide-y divide-gray-50 dark:divide-slate-800">
            {issues.map((item, i) => (
              <button
                key={item.id || i}
                onClick={() => setSelectedIssue(item)}
                className="w-full text-left p-6 hover:bg-blue-50/30 dark:hover:bg-slate-800/50 transition-all group/item flex gap-5 items-start"
              >
                <span className={`flex-shrink-0 w-9 h-9 rounded-2xl flex items-center justify-center text-[11px] font-black tracking-tighter transition-all group-hover/item:scale-110 ${
                  i === 0 ? "bg-blue-600 text-white shadow-xl shadow-blue-200 dark:shadow-none" : 
                  i === 1 ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" :
                  i === 2 ? "bg-blue-50 dark:bg-slate-800 text-blue-400" : "bg-gray-50 dark:bg-slate-800 text-gray-400 dark:text-gray-500"
                }`}>
                  #{i + 1}
                </span>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-3 mb-1.5">
                    <p className="text-[15px] font-black text-gray-900 dark:text-white line-clamp-1 group-hover/item:text-blue-600 dark:group-hover/item:text-blue-400 transition-colors tracking-tight">
                      {item.title}
                    </p>
                    <span className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest whitespace-nowrap bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg transition-colors">
                      {getRelativeTime(item.publishDate)}
                    </span>
                  </div>
                  
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed font-medium transition-colors">
                    {getExcerpt(cleanDescription(item.description || item.desc))}
                  </p>

                  <div className="mt-4 flex items-center gap-3">
                    <div className="px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-[9px] font-black uppercase tracking-widest border border-blue-100 dark:border-blue-900/30 transition-colors">
                      Berita Utama
                    </div>
                    {i < 3 && (
                      <div className="flex items-center gap-1.5 text-blue-500 dark:text-blue-400">
                        <div className="w-1 h-1 rounded-full bg-blue-500 animate-ping" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Trending</span>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 px-8 text-center bg-gray-50/30 dark:bg-slate-800/20">
            <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-[2rem] shadow-sm border border-gray-100 dark:border-slate-700 flex items-center justify-center mb-6 text-gray-200 dark:text-gray-600 transition-colors">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v10a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-sm font-black text-gray-400 dark:text-gray-500 italic tracking-tight transition-colors">Belum ada isu hukum terkini yang tercatat hari ini.</p>
          </div>
        )}
      </div>

      {/* FULLSCREEN DETAIL MODAL (Rendered via Portal) */}
      {mounted && selectedIssue && createPortal(
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/20 backdrop-blur-md animate-fadeIn p-4 md:p-8"
          onClick={() => setSelectedIssue(null)}
        >
          <div 
            className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] w-full max-w-6xl h-full md:h-[90vh] overflow-hidden flex flex-col relative transition-all animate-slideUp border border-transparent dark:border-slate-800"
            onClick={e => e.stopPropagation()}
          >
            
            {/* STICKY HEADER */}
            <div className="flex-none p-6 md:p-8 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-20">
              <div className="flex items-center gap-3">
                <div className="w-2 h-8 bg-blue-600 rounded-full" />
                <div>
                  <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-0.5">Analisis Isu Terkini</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white transition-colors">Publikasi: {new Date(selectedIssue.publishDate).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedIssue(null)}
                className="bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 p-3 rounded-2xl transition-all hover:rotate-90"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600 dark:text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            {/* SCROLLABLE CONTENT AREA */}
              <div className="flex-1 overflow-y-auto custom-scrollbar bg-gray-50/30 dark:bg-slate-800/20">
              <div className="max-w-4xl mx-auto px-6 py-12 md:px-12 md:py-16">
                
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-600 text-white rounded-full text-[10px] font-black tracking-widest uppercase mb-8 shadow-lg shadow-blue-200 dark:shadow-none">
                  Top Priority News
                </div>
                
                <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white leading-[1.1] mb-10 tracking-tight transition-colors">
                  {selectedIssue.title}
                </h2>

                {/* Metadata Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 p-8 bg-white dark:bg-slate-800/80 border border-gray-100 dark:border-slate-700 rounded-[2rem] shadow-sm transition-colors">
                   <div>
                      <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Kategori</p>
                      <p className="text-sm font-bold text-blue-600 dark:text-blue-400">Hukum & Politik</p>
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Status</p>
                      <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>Tervalidasi</span>
                      </div>
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Lokasi</p>
                      <p className="text-sm font-bold text-gray-700 dark:text-gray-300 transition-colors">{selectedIssue.location || "Nasional"}</p>
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Waktu Update</p>
                      <p className="text-sm font-bold text-gray-700 dark:text-gray-300 transition-colors">{getRelativeTime(selectedIssue.publishDate)}</p>
                   </div>
                </div>

                {/* Article Content */}
                <div className="prose prose-lg max-w-none prose-slate dark:prose-invert">
                  <p className="text-gray-700 dark:text-gray-300 leading-[1.9] text-xl font-medium whitespace-pre-wrap tracking-tight transition-colors">
                    {cleanDescription(selectedIssue.description || selectedIssue.desc)}
                  </p>
                </div>

                {/* REFERENCE SECTION */}
                <div className="mt-16 pt-12 border-t border-gray-200 dark:border-slate-700 transition-colors">
                  <p className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.809a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    Sumber Referensi &amp; Tautan Luar
                  </p>
                  
                  <div className="grid grid-cols-1">
                    <a 
                      href={selectedIssue.newsLink || "#"} 
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center justify-between p-8 bg-white dark:bg-slate-800/60 border border-gray-100 dark:border-slate-700 rounded-[2rem] transition-all group shadow-sm ${
                        !selectedIssue.newsLink ? "opacity-50 cursor-not-allowed pointer-events-none" : "hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-xl"
                      }`}
                    >
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 font-black text-2xl group-hover:scale-110 transition-transform">
                          {formatDomain(selectedIssue.newsLink).charAt(0)}
                        </div>
                        <div>
                          <p className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2 transition-colors">
                            {formatDomain(selectedIssue.newsLink)}
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 font-medium tracking-tight mt-1 transition-colors">Portal berita resmi dan terverifikasi • Kunjungi halaman asli</p>
                        </div>
                      </div>
                      <div className="hidden md:flex px-6 py-3 bg-gray-50 dark:bg-slate-700 text-gray-500 dark:text-gray-400 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all font-bold text-sm items-center gap-2">
                        Buka Artikel
                      </div>
                    </a>
                  </div>
                </div>
              </div>
            </div>
            
            {/* STICKY FOOTER */}
            <div className="flex-none p-6 md:p-8 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between transition-colors">
              <div className="hidden md:flex items-center gap-4 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                <span>© 2024 TanyaHukum Intelligence</span>
                <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                <span>Verified Insights</span>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <button 
                  onClick={() => handleShare(selectedIssue.newsLink)}
                  disabled={!selectedIssue.newsLink}
                  className={`flex-1 md:flex-none px-8 py-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 rounded-[1.25rem] font-bold transition-all shadow-sm flex items-center justify-center gap-2 ${
                    !selectedIssue.newsLink ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100 dark:hover:bg-slate-700"
                  }`}
                >
                  {copyFeedback ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-emerald-600">Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                      Bagikan Isu
                    </>
                  )}
                </button>
                <button 
                  onClick={() => setSelectedIssue(null)}
                  className="flex-1 md:flex-none px-12 py-4 bg-blue-600 text-white rounded-[1.25rem] font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-200"
                >
                  Selesai Membaca
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}