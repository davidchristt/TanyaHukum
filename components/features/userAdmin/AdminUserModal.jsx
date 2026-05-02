"use client";

import { useState, useEffect } from "react";

export default function AdminUserModal({ onClose, onSave, initialData }) {
  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    role: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        nama: initialData.nama,
        email: initialData.email,
        role: initialData.role.toString(),
      });
    }
  }, [initialData]);

  const handleSubmit = () => {
    const newErrors = {};

    if (!formData.nama.trim()) newErrors.nama = "Nama pengguna wajib diisi!";
    
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email pengguna wajib diisi!";
    } else if (!emailPattern.test(formData.email)) {
      newErrors.email = "Format email tidak valid!";
    }

    if (!formData.role) newErrors.role = "Role pengguna belum dipilih!";

    // Hentikan jika ada error
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      nama: formData.nama,
      email: formData.email,
      role: parseInt(formData.role),
    });
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-[450px]">
        
        <h2 className="text-2xl font-bold mb-6 text-gray-900">
          {initialData ? "Edit Pengguna" : "Tambah Pengguna"}
        </h2>
        
        <div className="space-y-5">
          
          {/* INPUT NAMA */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Nama</label>
            <input 
              type="text" 
              value={formData.nama}
              onChange={(e) => {
                setFormData({ ...formData, nama: e.target.value });
                if (errors.nama) setErrors({ ...errors, nama: null });
              }}
              placeholder="Masukkan Nama Pengguna" 
              className={`w-full border rounded-xl p-3 text-sm focus:ring-2 outline-none transition ${
                errors.nama ? "border-red-500 focus:ring-red-400 bg-red-50/50" : "border-gray-300 focus:ring-blue-500"
              }`} 
            />
            {errors.nama && <p className="text-xs text-red-500 mt-1 ml-1">{errors.nama}</p>}
          </div>

          {/* INPUT EMAIL */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input 
              type="email" 
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value });
                if (errors.email) setErrors({ ...errors, email: null });
              }}
              placeholder="Masukkan Email Pengguna" 
              className={`w-full border rounded-xl p-3 text-sm focus:ring-2 outline-none transition ${
                errors.email ? "border-red-500 focus:ring-red-400 bg-red-50/50" : "border-gray-300 focus:ring-blue-500"
              }`} 
            />
            {errors.email && <p className="text-xs text-red-500 mt-1 ml-1">{errors.email}</p>}
          </div>

          {/* DROPDOWN ROLE */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Role</label>
            <div className="relative">
              <select 
                value={formData.role}
                onChange={(e) => {
                  setFormData({ ...formData, role: e.target.value });
                  if (errors.role) setErrors({ ...errors, role: null });
                }}
                className={`w-full border rounded-xl p-3 text-sm focus:ring-2 outline-none appearance-none cursor-pointer transition ${
                  errors.role ? "border-red-500 focus:ring-red-400 bg-red-50/50 text-red-500" : "border-gray-300 focus:ring-blue-500 bg-white"
                }`}
              >
                <option value="" disabled>Pilih Role</option>
                <option value="1">1 (Admin)</option>
                <option value="0">0 (User Biasa)</option>
              </select>
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                <svg className={`w-4 h-4 ${errors.role ? 'text-red-500' : 'text-blue-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
            </div>
            {errors.role && <p className="text-xs text-red-500 mt-1 ml-1">{errors.role}</p>}
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