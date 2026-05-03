"use client";

import { useState, useEffect } from "react";

export default function AdminProfileForm({ userData, updateLocalUser }) {
  const [showPassword, setShowPassword] = useState(false);
  const togglePassword = () => setShowPassword(!showPassword);

  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    password: "", 
  });

  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // Otomatis mengisi form dengan data yang ditarik dari page.js
  useEffect(() => {
    setFormData({
      nama: userData.nama || "",
      email: userData.email || "",
      password: ""
    });
  }, [userData]);

  const handleSubmit = async () => {
    const newErrors = {};

    if (!formData.nama.trim()) newErrors.nama = "Nama tidak boleh kosong!";
    
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email tidak boleh kosong!";
    } else if (!emailPattern.test(formData.email)) {
      newErrors.email = "Format email tidak valid!";
    }

    if (formData.password && formData.password.length < 8) {
      newErrors.password = "Kata sandi minimal 8 karakter!";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSaving(true);

    try {
      // Susun data yang mau dikirim ke Database
      const payload = {
        name: formData.nama,
        email: formData.email,
        role: userData.role
      };
      
      // Kirim password HANYA jika diketik (mau diubah)
      if (formData.password) {
        payload.password = formData.password;
      }

      const response = await fetch(`/api/admin/users/${userData.id}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${userData.id}`
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        // Update tampilan dan localStorage setelah sukses
        updateLocalUser({
          nama: formData.nama,
          name: formData.nama,
          email: formData.email
        });
        
        alert("Berhasil! Profil Anda telah diperbarui di database.");
        setFormData({ ...formData, password: "" }); // Kosongkan form password lagi
      } else {
        alert("Gagal memperbarui profil. Email mungkin sudah dipakai.");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Terjadi kesalahan pada server.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-md space-y-4">
      <h2 className="text-xl font-semibold text-gray-800 mb-2">
        Pengaturan Akun
      </h2>

      <div>
        <label className="text-sm font-medium text-gray-700">Nama</label>
        <input
          type="text"
          value={formData.nama}
          onChange={(e) => {
            setFormData({ ...formData, nama: e.target.value });
            if (errors.nama) setErrors({ ...errors, nama: null });
          }}
          placeholder="Masukkan nama lengkap"
          className={`w-full mt-1.5 px-4 py-2 border rounded-lg text-gray-900 placeholder-gray-400 outline-none focus:ring-2 transition ${
            errors.nama ? "border-red-500 focus:ring-red-400 bg-red-50/50" : "border-blue-200 focus:ring-blue-400"
          }`}
        />
        {errors.nama && <p className="text-xs text-red-500 mt-1">{errors.nama}</p>}
      </div>

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
            autoComplete="new-password"
            placeholder="Biarkan kosong jika tidak ingin ganti sandi"
            className={`w-full px-4 py-2 border rounded-lg text-gray-900 placeholder-gray-400 outline-none focus:ring-2 transition ${
              errors.password ? "border-red-500 focus:ring-red-400 bg-red-50/50" : "border-blue-200 focus:ring-blue-400"
            }`}
          />
          <span
            onClick={togglePassword}
            className="absolute right-3 top-2.5 cursor-pointer p-1 hover:bg-gray-100 rounded-full transition"
          >
            <img src={showPassword ? "/icons/mataPW.svg" : "/icons/mataKetutup.svg"} alt="toggle" className="w-5 h-5 opacity-70 hover:opacity-100" />
          </span>
        </div>
        {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
      </div>

      <div className="pt-2">
        <button 
          onClick={handleSubmit}
          disabled={isSaving}
          className={`w-full py-3 text-white font-semibold rounded-xl shadow-lg transition ${
            isSaving ? "bg-gray-400 cursor-not-allowed" : "bg-[#1e75ff] hover:bg-blue-700 shadow-blue-200"
          }`}
        >
          {isSaving ? "Menyimpan ke Database..." : "Simpan Perubahan"}
        </button>
      </div>
    </div>
  );
}