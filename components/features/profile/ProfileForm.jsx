"use client";

import { useEffect, useState } from "react";
import { getProfile, updateProfile } from "@/src/lib/profile";

export default function ProfileForm({ onClose }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
  });

  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);

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
        });
      } catch (err) {
        console.error(err.message);
      }
    };

    load();
  }, []);

  // ==============================
  // HANDLE CHANGE
  // ==============================
  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      name: e.target.value,
    }));
  };

  // ==============================
  // SUBMIT
  // ==============================
  const handleSubmit = async () => {
    if (!form.name.trim()) return;

    setLoading(true);

    try {
      await updateProfile({ name: form.name });

      // 🔥 FIX PENTING: sync ke localStorage
      const stored = JSON.parse(localStorage.getItem("user") || "{}");

      const updatedUser = {
        ...stored,
        name: form.name,
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));

      // 🔥 trigger semua UI update
      window.dispatchEvent(new Event("auth-change"));

      // 🔥 toast
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2500);

      // 🔥 close modal
      if (onClose) onClose();

    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* CARD */}
      <div className="bg-white rounded-2xl p-6 shadow-md space-y-5">

        <h2 className="text-xl font-semibold text-gray-800">
          Pengaturan Akun
        </h2>

        {/* NAMA */}
        <div>
          <label className="text-sm text-gray-600">Nama</label>
          <input
            value={form.name}
            onChange={handleChange}
            placeholder="Masukkan nama"
            className="w-full mt-1 px-4 py-2 border border-gray-200 rounded-lg 
            text-gray-900 outline-none 
            focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* EMAIL */}
        <div>
          <label className="text-sm text-gray-600">Email</label>
          <input
            value={form.email}
            readOnly
            className="w-full mt-1 px-4 py-2 border border-gray-200 rounded-lg 
            bg-gray-100 text-gray-500 cursor-not-allowed"
          />
        </div>

        {/* BUTTON */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-3 bg-blue-500 hover:bg-blue-600 
          disabled:bg-gray-300 text-white rounded-lg 
          transition font-medium"
        >
          {loading ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </div>

      {/* TOAST */}
      {showToast && (
        <div className="fixed top-6 right-6 z-50">
          <div className="bg-white border border-green-200 shadow-xl rounded-xl px-5 py-4 flex items-center gap-3">

            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-sm">
              ✓
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-900">
                Berhasil
              </p>
              <p className="text-xs text-gray-500">
                Nama berhasil diperbarui
              </p>
            </div>

          </div>
        </div>
      )}
    </>
  );
}