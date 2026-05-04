"use client";

import { useEffect, useState } from "react";
import { getProfile, updateProfile } from "@/src/lib/profile";

export default function ProfileForm({ onClose }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    personalContext: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // ==============================
  // LOAD DATA
  // ==============================
  useEffect(() => {
    const load = async () => {
      try {
        const data = await getProfile();
        setForm({
          name: data.name || "",
          email: data.email || "",
          personalContext: data.personalContext || "",
        });
      } catch (err) {
        setError(err.message);
      }
    };

    load();
  }, []);

  // ==============================
  // HANDLE CHANGE
  // ==============================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ==============================
  // SUBMIT
  // ==============================
  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setError("Nama tidak boleh kosong");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      await updateProfile({ 
        name: form.name,
        personalContext: form.personalContext 
      });

      // Sync to localStorage for global state
      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      const updatedUser = {
        ...stored,
        name: form.name,
        nama: form.name, // Ensure both fields are synced to avoid UI inconsistency
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      // Trigger UI updates
      window.dispatchEvent(new Event("auth-change"));
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* CARD: BASIC INFO */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-white/20 space-y-6 animate-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <h2 className="text-xl font-bold text-gray-900">Pengaturan Akun</h2>
          <span className="text-[10px] uppercase tracking-widest font-bold text-blue-500 bg-blue-50 px-2 py-1 rounded-md">
            Informasi Dasar
          </span>
        </div>

        <div className="space-y-4">
          {/* NAMA */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Nama Lengkap</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Masukkan nama Anda"
              className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-2xl 
              text-gray-900 outline-none transition-all
              focus:ring-2 focus:ring-blue-400/20 focus:border-blue-400 focus:bg-white"
            />
          </div>

          {/* EMAIL */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Alamat Email</label>
            <div className="relative">
              <input
                value={form.email}
                readOnly
                className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-2xl 
                text-gray-400 cursor-not-allowed italic"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CARD: PERSONALIZATION */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-white/20 space-y-6 animate-in slide-in-from-bottom-4 duration-500 delay-75">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <h2 className="text-xl font-bold text-gray-900">Personalisasi AI</h2>
          <span className="text-[10px] uppercase tracking-widest font-bold text-purple-500 bg-purple-50 px-2 py-1 rounded-md">
            Konfigurasi Chatbot
          </span>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Konteks Personal</label>
          <p className="text-[10px] text-gray-400 ml-1 mb-2">
            Berikan informasi tambahan agar AI dapat merespons sesuai kebutuhan Anda (misal: "Saya seorang mahasiswa hukum" atau "Gunakan bahasa yang sangat formal").
          </p>
          <textarea
            name="personalContext"
            value={form.personalContext}
            onChange={handleChange}
            placeholder="Contoh: Saya ingin konsultasi mengenai hukum ketenagakerjaan dengan gaya bahasa yang mudah dipahami..."
            rows={4}
            className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-2xl 
            text-gray-900 outline-none transition-all resize-none
            focus:ring-2 focus:ring-purple-400/20 focus:border-purple-400 focus:bg-white"
          />
        </div>
      </div>

      {/* FEEDBACK & ACTIONS */}
      <div className="space-y-4 px-2">
        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-2xl text-xs font-medium flex items-center gap-3 animate-shake">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 text-green-600 p-4 rounded-2xl text-xs font-medium flex items-center gap-3 animate-in zoom-in-95">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            Profil dan preferensi berhasil disimpan!
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600
          disabled:from-gray-400 disabled:to-gray-300 text-white rounded-2xl shadow-lg shadow-blue-200
          transition-all font-bold active:scale-[0.98] flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Menyimpan...</span>
            </>
          ) : (
            "Simpan Perubahan"
          )}
        </button>
      </div>
    </div>
  );
}