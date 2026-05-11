"use client";

import { useState, useRef, useEffect } from "react";

export default function AdminDataModal({ onClose, onSave, initialData }) {
  const [formData, setFormData] = useState({
    deskripsi: "",
    kategori: "Umum", // <-- TAMBAHAN: Default kategori
  });
  
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({ 
        deskripsi: initialData.deskripsi || "",
        kategori: initialData.category || "Umum" // <-- TAMBAHAN: Tarik kategori lama dari DB
      });
      setSelectedFile({ name: initialData.dokumen, isExisting: true });
    }
  }, [initialData]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      if (errors.dokumen) setErrors({ ...errors, dokumen: null });
    }
  };

  const handleSubmit = () => {
    const newErrors = {};

    if (!selectedFile) newErrors.dokumen = "Harap upload dokumen terlebih dahulu!";
    if (!formData.deskripsi.trim()) newErrors.deskripsi = "Deskripsi metadata wajib diisi!";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // <-- PERBAIKAN: Kirim juga data kategorinya ke AdminDataList
    onSave({
      dokumen: selectedFile.name,
      deskripsi: formData.deskripsi,
      kategori: formData.kategori, 
    });
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-[450px]">
        
        <h2 className="text-2xl font-bold mb-6 text-gray-900">
          {initialData ? "Edit Dokumen Hukum" : "Tambah Dokumen Hukum"}
        </h2>
        
        <div className="space-y-5">
          
          {/* UPLOAD AREA */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Upload Dokumen</label>
            <div 
              onClick={() => fileInputRef.current.click()}
              className={`w-full border rounded-xl p-4 flex flex-col justify-center items-center cursor-pointer transition min-h-[100px] ${
                errors.dokumen ? "border-red-500 bg-red-50/50" : "border-blue-200 bg-blue-50/30 hover:bg-blue-50"
              }`}
            >
              <input 
                type="file" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx"
              />
              {selectedFile ? (
                <div className="flex flex-col items-center">
                  <p className="text-sm font-semibold text-blue-600 text-center truncate max-w-[300px]">
                    {selectedFile.name}
                  </p>
                  <span className="text-xs text-gray-400 mt-1">Klik untuk mengganti file</span>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <img src="/icons/upload.svg" alt="Upload" className="w-6 h-6 object-contain mb-2" />
                  <span className={`text-xs ${errors.dokumen ? 'text-red-500' : 'text-gray-500'}`}>
                    Klik untuk memilih dokumen
                  </span>
                </div>
              )}
            </div>
            {errors.dokumen && <p className="text-xs text-red-500 mt-1 ml-1">{errors.dokumen}</p>}
          </div>

          {/* INPUT KATEGORI (TAMBAHAN BARU) */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Kategori</label>
            <select 
              value={formData.kategori}
              onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
              className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white cursor-pointer transition"
            >
              <option value="Umum">Umum</option>
              <option value="Undang-Undang">Undang-Undang</option>
              <option value="Peraturan Pemerintah">Peraturan Pemerintah</option>
              <option value="Peraturan Daerah">Peraturan Daerah</option>
              <option value="Peraturan Presiden">Peraturan Presiden</option>
              <option value="Perdata">Perdata</option>
              <option value="Pidana">Pidana</option>
            </select>
          </div>

          {/* INPUT DESKRIPSI */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Deskripsi Metadata</label>
            <input 
              type="text" 
              value={formData.deskripsi}
              onChange={(e) => {
                setFormData({ ...formData, deskripsi: e.target.value });
                if (errors.deskripsi) setErrors({ ...errors, deskripsi: null });
              }}
              placeholder="Masukkan Deskripsi" 
              className={`w-full border rounded-xl p-3 text-sm focus:ring-2 outline-none transition ${
                errors.deskripsi ? "border-red-500 focus:ring-red-400 bg-red-50/50" : "border-gray-300 focus:ring-blue-500"
              }`} 
            />
            {errors.deskripsi && <p className="text-xs text-red-500 mt-1 ml-1">{errors.deskripsi}</p>}
          </div>
        </div>

        {/* BUTTON ACTIONS */}
        <div className="mt-8 space-y-3">
          <button 
            onClick={handleSubmit}
            className="w-full bg-[#1e75ff] text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200"
          >
            {initialData ? "Simpan Perubahan" : "Simpan"}
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