"use client";

import { useState } from "react";

export default function AdminIssueModal({ onClose, onSave }) {
  const [formData, setFormData] = useState({
    title: "",
    desc: "",
    link: "", 
    time: "Baru Saja",
  });

  const [errors, setErrors] = useState({});

  const handleSubmit = () => {
    const newErrors = {};

    // Validasi Judul
    if (!formData.title.trim()) {
      newErrors.title = "Judul isu wajib diisi!";
    }

    // Validasi Deskripsi (Min 20 kata)
    const wordCount = formData.desc.trim().split(/\s+/).filter(word => word.length > 0).length;
    if (!formData.desc.trim()) {
      newErrors.desc = "Deskripsi singkat wajib diisi!";
    } else if (wordCount < 20) {
      newErrors.desc = `Deskripsi minimal harus 20 kata! (Baru ${wordCount} kata)`;
    }

    // Validasi Link Berita
    const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    if (!formData.link.trim()) {
      newErrors.link = "Link berita wajib diisi!";
    } else if (!urlPattern.test(formData.link)) {
      newErrors.link = "Format Link tidak valid! (Contoh: https://www.unpad.ac.id)";
    }
    
    // Hentikan proses jika ada error
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Jika aman, kirim data
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-[450px]">
        
        <h2 className="text-2xl font-bold mb-6 text-gray-900">
          Isu Terkini
        </h2>
        
        <div className="space-y-5">
          {/* INPUT JUDUL */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Judul</label>
            <input 
              type="text" 
              value={formData.title}
              onChange={(e) => {
                setFormData({ ...formData, title: e.target.value });
                if (errors.title) setErrors({ ...errors, title: null });
              }}
              placeholder="Perampokan di Unpad" 
              className={`w-full border rounded-xl p-3 text-sm focus:ring-2 outline-none transition ${
                errors.title ? "border-red-500 focus:ring-red-400 bg-red-50/50" : "border-gray-300 focus:ring-blue-500"
              }`} 
            />
            {errors.title && <p className="text-xs text-red-500 mt-1 ml-1">{errors.title}</p>}
          </div>

          {/* INPUT DESKRIPSI */}
          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <label className="text-sm font-medium text-gray-700">Deskripsi Singkat</label>
              <span className={`text-xs ${errors.desc ? 'text-red-500' : 'text-gray-400'}`}>Min. 20 kata</span>
            </div>
            <textarea 
              value={formData.desc}
              onChange={(e) => {
                setFormData({ ...formData, desc: e.target.value });
                if (errors.desc) setErrors({ ...errors, desc: null });
              }}
              placeholder="Masukkan Deskripsi singkat (minimal 20 kata)" 
              className={`w-full border rounded-xl p-3 text-sm focus:ring-2 outline-none h-24 transition ${
                errors.desc ? "border-red-500 focus:ring-red-400 bg-red-50/50" : "border-gray-300 focus:ring-blue-500"
              }`}
            />
            {errors.desc && <p className="text-xs text-red-500 mt-1 ml-1">{errors.desc}</p>}
          </div>

          {/* INPUT LINK */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Link Berita</label>
            <input 
              type="text" 
              value={formData.link}
              onChange={(e) => {
                setFormData({ ...formData, link: e.target.value });
                if (errors.link) setErrors({ ...errors, link: null });
              }}
              placeholder="Masukkan Link Berita" 
              className={`w-full border rounded-xl p-3 text-sm focus:ring-2 outline-none transition ${
                errors.link ? "border-red-500 focus:ring-red-400 bg-red-50/50" : "border-gray-300 focus:ring-blue-500"
              }`} 
            />
            {errors.link && <p className="text-xs text-red-500 mt-1 ml-1">{errors.link}</p>}
          </div>
        </div>

        {/* BUTTON ACTIONS */}
        <div className="mt-8 space-y-3">
          <button 
            onClick={handleSubmit}
            className="w-full bg-[#1e75ff] text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200"
          >
            Simpan
          </button>
          
          <button 
            onClick={onClose}
            className="w-full text-gray-500 text-sm font-medium hover:text-gray-700 transition"
          >
            Batal
          </button>
        </div>

      </div>
    </div>
  );
}