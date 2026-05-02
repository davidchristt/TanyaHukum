"use client";

import { useState } from "react";

export default function AdminProfileForm() {
  const [showPassword, setShowPassword] = useState(false);
  const togglePassword = () => setShowPassword(!showPassword);

  const [formData, setFormData] = useState({
    nama: "Admin Superuser",
    email: "admin@tanyahukum.com",
    password: "", 
  });

  // State khusus untuk menampung pesan error per kolom
  const [errors, setErrors] = useState({});

  const handleSubmit = () => {
    const newErrors = {};

    // 1. Validasi Nama
    if (!formData.nama.trim()) {
      newErrors.nama = "Nama tidak boleh kosong!";
    }

    // 2. Validasi Email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email tidak boleh kosong!";
    } else if (!emailPattern.test(formData.email)) {
      newErrors.email = "Format email tidak valid! (Contoh: admin@mail.com)";
    }

    // 3. Validasi Password
    if (formData.password && formData.password.length < 6) {
      newErrors.password = "Kata sandi minimal 6 karakter!";
    }

    // Jika ada error, simpan ke state dan hentikan proses
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Lolos semua validasi
    setErrors({}); // Bersihkan error sebelumnya
    alert("Berhasil! Profil Anda telah diperbarui."); // Boleh diganti Toast/Notifikasi nanti
    setFormData({ ...formData, password: "" });
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-md space-y-4">
      <h2 className="text-xl font-semibold text-gray-800 mb-2">
        Pengaturan Akun
      </h2>

      {/* ===== NAMA ===== */}
      <div>
        <label className="text-sm font-medium text-gray-700">Nama</label>
        <input
          type="text"
          value={formData.nama}
          onChange={(e) => {
            setFormData({ ...formData, nama: e.target.value });
            if (errors.nama) setErrors({ ...errors, nama: null }); // Hilangkan error saat ngetik
          }}
          placeholder="Masukkan nama lengkap"
          className={`w-full mt-1.5 px-4 py-2 border rounded-lg text-gray-900 placeholder-gray-400 outline-none focus:ring-2 transition ${
            errors.nama ? "border-red-500 focus:ring-red-400 bg-red-50/50" : "border-blue-200 focus:ring-blue-400"
          }`}
        />
        {/* Teks Error Merah */}
        {errors.nama && <p className="text-xs text-red-500 mt-1">{errors.nama}</p>}
      </div>

      {/* ===== EMAIL ===== */}
      <div>
        <label className="text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => {
            setFormData({ ...formData, email: e.target.value });
            if (errors.email) setErrors({ ...errors, email: null });
          }}
          placeholder="admin@example.com"
          className={`w-full mt-1.5 px-4 py-2 border rounded-lg text-gray-900 placeholder-gray-400 outline-none focus:ring-2 transition ${
            errors.email ? "border-red-500 focus:ring-red-400 bg-red-50/50" : "border-blue-200 focus:ring-blue-400"
          }`}
        />
        {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
      </div>

      {/* ===== PASSWORD ===== */}
      <div>
        <label className="text-sm font-medium text-gray-700">Ganti Kata Sandi (Opsional)</label>
        <div className="relative mt-1.5">
          <input
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={(e) => {
              setFormData({ ...formData, password: e.target.value });
              if (errors.password) setErrors({ ...errors, password: null });
            }}
            placeholder="Biarkan kosong jika tidak ingin ganti sandi"
            className={`w-full px-4 py-2 border rounded-lg text-gray-900 placeholder-gray-400 outline-none focus:ring-2 transition ${
              errors.password ? "border-red-500 focus:ring-red-400 bg-red-50/50" : "border-blue-200 focus:ring-blue-400"
            }`}
          />
          <span
            onClick={togglePassword}
            className="absolute right-3 top-2.5 cursor-pointer p-1 hover:bg-gray-100 rounded-full transition"
          >
            <img src={showPassword ? "/icons/mataPW.svg" : "/icons/tutupMata.svg"} alt="toggle" className="w-5 h-5 opacity-70 hover:opacity-100" />
          </span>
        </div>
        {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
      </div>

      {/* BUTTON */}
      <div className="pt-2">
        <button 
          onClick={handleSubmit}
          className="w-full py-3 bg-[#1e75ff] text-white font-semibold rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition"
        >
          Simpan Perubahan
        </button>
      </div>
    </div>
  );
}