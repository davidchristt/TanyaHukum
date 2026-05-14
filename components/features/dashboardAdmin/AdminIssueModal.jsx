"use client";

import { useState } from "react";
import { createPortal } from "react-dom";

export default function AdminIssueModal({ onClose, onSave }) {
  const [formData, setFormData] = useState({
    title: "",
    desc: "",
    link: "",
    location: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Judul wajib diisi";
    if (!formData.desc.trim()) newErrors.desc = "Deskripsi wajib diisi";
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    setIsSubmitting(true);
    try {
      await onSave(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/30 backdrop-blur-md animate-fadeIn p-4 transition-colors">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] w-full max-w-[640px] overflow-hidden transform transition-all animate-slideUp border border-gray-100 dark:border-slate-800 transition-colors">

        {/* HEADER */}
        <div className="bg-gray-50/50 dark:bg-slate-800/50 px-8 py-6 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between transition-colors">
          <div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3 transition-colors">
              <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
              Tambah Isu Terkini
            </h2>
            <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1 transition-colors">
              Kelola berita dan isu hukum nasional
            </p>
          </div>
          <button onClick={onClose} className="p-2.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 dark:text-gray-500"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="p-8 space-y-5">

          {/* SECTION: Basic Info */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1 transition-colors">Judul Isu</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Contoh: RUU Cipta Kerja Omnibus Law..."
              className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl p-3.5 text-sm font-bold text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-500/10 outline-none transition transition-colors"
            />
            {errors.title && <p className="text-[9px] font-bold text-red-500 ml-1 italic">{errors.title}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1 transition-colors">Deskripsi Singkat</label>
            <textarea
              value={formData.desc}
              onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
              rows="3"
              placeholder="Ringkasan singkat mengenai isu ini..."
              className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl p-3.5 text-sm font-bold text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-500/10 outline-none transition resize-none transition-colors"
            />
            {errors.desc && <p className="text-[9px] font-bold text-red-500 ml-1 italic">{errors.desc}</p>}
          </div>

          {/* SECTION: Metadata (2-col) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1 transition-colors">Lokasi / Wilayah</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Jakarta, Indonesia..."
                className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl p-3.5 text-sm font-bold text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-500/10 outline-none transition transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1 transition-colors">Link Sumber Berita</label>
              <input
                type="url"
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                placeholder="https://..."
                className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl p-3.5 text-sm font-bold text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-500/10 outline-none transition transition-colors"
              />
            </div>
          </div>

          {/* BUTTONS */}
          <div className="pt-4 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full bg-gray-50 dark:bg-slate-800 text-gray-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-widest hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition py-4 rounded-xl active:scale-95 transition-colors"
            >
              Batalkan
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition py-4 rounded-xl shadow-lg shadow-blue-100 dark:shadow-blue-900/20 active:scale-95 flex items-center justify-center gap-2 transition-all"
            >
              {isSubmitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Publikasikan Isu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}