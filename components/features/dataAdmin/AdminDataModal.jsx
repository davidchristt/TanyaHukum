"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

export default function AdminDataModal({ onClose, onSave, initialData }) {
  const [formData, setFormData] = useState({
    title: "",
    category: "Administrasi Negara",
    description: "",
  });
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [errors, setErrors] = useState({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (initialData) {
      setFormData({ 
        title: initialData.dokumen || "",
        category: initialData.category || "Administrasi Negara",
        description: initialData.deskripsi || ""
      });
      setSelectedFile({ name: initialData.dokumen, size: 0, isExisting: true });
    }
    return () => setMounted(false);
  }, [initialData]);

  const handleFileChange = (file) => {
    if (file) {
      setSelectedFile(file);
      // Auto-title logic: if current title is empty, use filename
      if (!formData.title.trim()) {
        setFormData(prev => ({ ...prev, title: file.name }));
      }
      if (errors.dokumen) setErrors(prev => ({ ...prev, dokumen: null }));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleFileChange(file);
  };

  const handleSubmit = async () => {
    const newErrors = {};
    if (!selectedFile) newErrors.dokumen = "File dokumen wajib diunggah";
    if (!formData.title.trim()) newErrors.title = "Judul dokumen wajib diisi";
    if (!formData.description.trim()) newErrors.description = "Deskripsi metadata wajib diisi";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsUploading(true);
    try {
      // Simulate professional upload delay
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      await onSave({
        title: formData.title,
        dokumen: selectedFile.name,
        deskripsi: formData.description,
        kategori: formData.category,
        fileSize: selectedFile.size || 0,
        fileName: selectedFile.name,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/30 backdrop-blur-md animate-fadeIn p-4">
      <div className="bg-white rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] w-full max-w-[850px] overflow-hidden transform transition-all animate-slideUp">
        
        {/* HEADER SECTION */}
        <div className="bg-gray-50/50 px-10 py-8 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
              <div className="w-2 h-8 bg-blue-600 rounded-full" />
              {initialData ? "Kelola Dokumen" : "Tambah Dokumen Hukum"}
            </h2>
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mt-1">
              Unggah dan kelola regulasi hukum nasional
            </p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-gray-100 rounded-2xl transition">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div className="p-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            
            {/* LEFT SIDE: UPLOAD WORKFLOW */}
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Sumber Dokumen</label>
                <div 
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => !isUploading && fileInputRef.current.click()}
                  className={`relative w-full aspect-[4/3] border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center transition-all group ${
                    selectedFile 
                      ? "border-blue-200 bg-blue-50/20" 
                      : errors.dokumen ? "border-red-200 bg-red-50/30" : "border-gray-100 bg-gray-50/50 hover:bg-blue-50/30 hover:border-blue-200"
                  } ${isUploading ? "cursor-wait opacity-50" : "cursor-pointer"}`}
                >
                  <input 
                    type="file" 
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={(e) => handleFileChange(e.target.files[0])}
                    accept=".pdf,.doc,.docx"
                  />
                  
                  {selectedFile ? (
                    <div className="text-center p-6 animate-fadeIn">
                       <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-200 shadow-sm">
                         <span className="text-[10px] font-black text-blue-600 uppercase">
                           {selectedFile.name?.split('.').pop() || "DOC"}
                         </span>
                       </div>
                       <p className="text-sm font-black text-gray-900 truncate max-w-[240px]">{selectedFile.name}</p>
                       <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-widest">
                         {selectedFile.name?.endsWith('.pdf') ? 'PDF Document' : selectedFile.name?.endsWith('.docx') ? 'Word Document' : 'Document'}
                         {selectedFile.size > 0 ? ` · ${selectedFile.size < 1024 * 1024 ? (selectedFile.size / 1024).toFixed(1) + ' KB' : (selectedFile.size / 1024 / 1024).toFixed(2) + ' MB'}` : ''}
                       </p>
                       <span className="inline-block mt-4 text-[9px] font-black text-blue-500 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-blue-100 uppercase">Ganti File</span>
                    </div>
                  ) : (
                    <div className="text-center animate-fadeIn">
                      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-100 group-hover:scale-110 group-hover:bg-blue-100 transition-all">
                        <img src="/icons/upload.svg" alt="Upload" className="w-6 h-6 opacity-40 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <p className="text-xs font-black text-gray-500 mb-1">Drag & Drop Dokumen</p>
                      <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Klik untuk menelusuri</p>
                    </div>
                  )}
                </div>
                {errors.dokumen && <p className="text-[9px] font-bold text-red-500 ml-1 italic">{errors.dokumen}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                 <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Format</p>
                    <p className="text-xs font-black text-gray-700">PDF, DOCX</p>
                 </div>
                 <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Max Size</p>
                    <p className="text-xs font-black text-gray-700">10.0 MB</p>
                 </div>
              </div>
            </div>

            {/* RIGHT SIDE: METADATA FORM */}
            <div className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Judul Dokumen</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Masukkan judul regulasi..."
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm font-black text-gray-900 focus:ring-4 focus:ring-blue-500/10 outline-none transition"
                />
                {!formData.title && (
                   <p className="text-[9px] text-blue-500 font-bold ml-1 italic">* Auto-generated title enabled</p>
                )}
                {errors.title && <p className="text-[9px] font-bold text-red-500 ml-1 italic">{errors.title}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Kategori Regulasi</label>
                <select 
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm font-black text-gray-900 focus:ring-4 focus:ring-blue-500/10 outline-none cursor-pointer"
                >
                  <option value="Administrasi Negara">Administrasi Negara</option>
                  <option value="Ketenagakerjaan">Ketenagakerjaan</option>
                  <option value="Perdata">Perdata</option>
                  <option value="Pidana">Pidana</option>
                  <option value="Pemerintahan">Pemerintahan</option>
                  <option value="Peraturan Presiden">Peraturan Presiden</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Deskripsi & Metadata</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="4"
                  placeholder="Masukkan ringkasan atau detail regulasi..."
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm font-bold text-gray-900 focus:ring-4 focus:ring-blue-500/10 outline-none transition resize-none"
                />
                <div className="flex justify-between items-center px-1">
                  {errors.description ? <p className="text-[9px] font-bold text-red-500 italic">{errors.description}</p> : <div />}
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{formData.description.length} Characters</p>
                </div>
              </div>
            </div>

          </div>

          {/* ACTION BUTTONS */}
          <div className="mt-12 flex items-center gap-4 border-t border-gray-100 pt-8">
            <button 
              onClick={onClose}
              disabled={isUploading}
              className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-900 transition disabled:opacity-30"
            >
              Batalkan
            </button>
            <button 
              onClick={handleSubmit}
              disabled={isUploading}
              className="flex-1 bg-blue-600 text-white font-black py-4 rounded-2xl hover:bg-blue-700 transition shadow-xl shadow-blue-100 disabled:opacity-50 disabled:cursor-wait active:scale-95 flex items-center justify-center gap-3"
            >
              {isUploading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span className="text-[11px] uppercase tracking-widest">Mengunggah...</span>
                </>
              ) : (
                <span className="text-[11px] uppercase tracking-widest">{initialData ? "Simpan Perubahan" : "Upload Dokumen Hukum"}</span>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );

  return mounted ? createPortal(modalContent, document.body) : null;
}