"use client";

import { useState, useEffect } from "react";

export default function AdminProfileForm({ activeTab, userData, updateLocalUser }) {
  const [formData, setFormData] = useState({ nama: "", email: "" });

  const [securityForm, setSecurityForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    setFormData({
      nama: userData.nama || userData.name || "",
      email: userData.email || "",
    });
    setSecurityForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setErrors({});
  }, [userData, activeTab]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSaveProfile = async () => {
    const newErrors = {};

    if (!formData.nama.trim()) newErrors.nama = "Nama tidak boleh kosong!";
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) newErrors.email = "Email tidak boleh kosong!";
    else if (!emailPattern.test(formData.email)) newErrors.email = "Format email tidak valid!";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSaving(true);

    try {
      const payload = {
        name: formData.nama,
        email: formData.email,
        role: userData.role
      };

      const response = await fetch(`/api/admin/users/${userData.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${userData.id}` },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        updateLocalUser({ nama: formData.nama, name: formData.nama, email: formData.email });
        showToast("Informasi profil berhasil disimpan!");
      } else {
        showToast("Gagal! Email mungkin sudah dipakai.", "error");
      }
    } catch (error) {
      showToast("Terjadi kesalahan pada server.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleInitialSecuritySubmit = () => {
    setErrors({});
    if (!securityForm.currentPassword || !securityForm.newPassword || !securityForm.confirmPassword) {
      setErrors({ security: "Semua field sandi wajib diisi!" });
      return;
    }
    if (securityForm.newPassword.length < 8) {
      setErrors({ security: "Sandi baru minimal 8 karakter!" });
      return;
    }
    if (securityForm.newPassword !== securityForm.confirmPassword) {
      setErrors({ security: "Konfirmasi sandi tidak cocok!" });
      return;
    }
    setShowConfirmModal(true);
  };

  const handleConfirmedSecuritySave = async () => {
    setShowConfirmModal(false);
    setIsSaving(true);

    try {
      const payload = {
        role: userData.role,
        currentPassword: securityForm.currentPassword,
        password: securityForm.newPassword
      };

      const response = await fetch(`/api/admin/users/${userData.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${userData.id}` },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        showToast("Kata sandi berhasil diubah!");
        setSecurityForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        const errorData = await response.json();
        showToast(errorData.error || "Gagal! Pastikan sandi lama benar.", "error");
      }
    } catch (error) {
      showToast("Terjadi kesalahan pada server.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="space-y-6 relative">
        {toast && (
          <div className="absolute -top-12 left-0 z-10 px-4 py-2 rounded-lg shadow-lg text-sm font-bold text-white transition-all animate-in fade-in" style={{ backgroundColor: toast.type === 'error' ? '#ef4444' : '#22c55e' }}>
            {toast.message}
          </div>
        )}

        {/* ======================= TAB PROFILE ======================= */}
        {activeTab === "profile" && (
          <>
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Nama Lengkap</label>
              <input type="text" value={formData.nama} onChange={(e) => { setFormData({ ...formData, nama: e.target.value }); if (errors.nama) setErrors({ ...errors, nama: null }); }} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium" />
              {errors.nama && <p className="text-xs font-bold text-red-500 animate-shake">{errors.nama}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Alamat Email</label>
              <input type="email" value={formData.email} onChange={(e) => { setFormData({ ...formData, email: e.target.value }); if (errors.email) setErrors({ ...errors, email: null }); }} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium" />
              {errors.email && <p className="text-xs font-bold text-red-500 animate-shake">{errors.email}</p>}
            </div>

            <button onClick={handleSaveProfile} disabled={isSaving} className="px-8 py-4 bg-black text-white rounded-2xl font-bold hover:opacity-80 transition-all active:scale-[0.98] disabled:opacity-30 flex items-center justify-center min-w-[200px]">
              {isSaving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : "Simpan Perubahan"}
            </button>
          </>
        )}

        {/* ======================= TAB KEAMANAN ======================= */}
        {activeTab === "keamanan" && (
          <>
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Kata Sandi Saat Ini</label>
              <div className="relative">
                <input type={showCurrent ? "text" : "password"} value={securityForm.currentPassword} onChange={(e) => { setSecurityForm({ ...securityForm, currentPassword: e.target.value }); setErrors({}); }} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-black/5 focus:border-black transition-all font-medium pr-12" placeholder="••••••••" />
                <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-4 top-1/2 -translate-y-1/2">
                  <img src={showCurrent ? "/icons/mataPW.svg" : "/icons/mataKetutup.svg"} alt="toggle" className="w-5 h-5 opacity-50 hover:opacity-100 transition-opacity" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Kata Sandi Baru</label>
              <div className="relative">
                <input type={showNew ? "text" : "password"} value={securityForm.newPassword} onChange={(e) => { setSecurityForm({ ...securityForm, newPassword: e.target.value }); setErrors({}); }} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-black/5 focus:border-black transition-all font-medium pr-12" placeholder="••••••••" />
                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-4 top-1/2 -translate-y-1/2">
                  <img src={showNew ? "/icons/mataPW.svg" : "/icons/mataKetutup.svg"} alt="toggle" className="w-5 h-5 opacity-50 hover:opacity-100 transition-opacity" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Konfirmasi Kata Sandi Baru</label>
              <div className="relative">
                <input type={showConfirm ? "text" : "password"} value={securityForm.confirmPassword} onChange={(e) => { setSecurityForm({ ...securityForm, confirmPassword: e.target.value }); setErrors({}); }} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-black/5 focus:border-black transition-all font-medium pr-12" placeholder="••••••••" />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2">
                  <img src={showConfirm ? "/icons/mataPW.svg" : "/icons/mataKetutup.svg"} alt="toggle" className="w-5 h-5 opacity-50 hover:opacity-100 transition-opacity" />
                </button>
              </div>
            </div>

            {errors.security && <p className="text-xs font-bold text-red-500 animate-shake">{errors.security}</p>}

            <button onClick={handleInitialSecuritySubmit} disabled={isSaving} className="px-8 py-4 bg-black text-white rounded-2xl font-bold hover:opacity-80 transition-all active:scale-[0.98] shadow-lg shadow-black/5 disabled:opacity-30 flex items-center justify-center min-w-[200px]">
              {isSaving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : "Ubah Kata Sandi"}
            </button>
          </>
        )}
      </div>

      {/* ======================= MODAL KONFIRMASI ======================= */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowConfirmModal(false)} />
          <div className="relative bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-300">
            <h3 className="text-xl font-black text-gray-900 mb-2">Konfirmasi Ubah Password</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-8">
              Apakah Anda yakin ingin mengubah kata sandi? Anda perlu masuk kembali jika sesi berakhir.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirmModal(false)} className="flex-1 px-4 py-3 bg-gray-100 text-gray-500 rounded-xl font-bold hover:bg-gray-200 transition-all">Batal</button>
              <button onClick={handleConfirmedSecuritySave} className="flex-1 px-4 py-3 bg-black text-white rounded-xl font-bold hover:opacity-80 transition-all shadow-lg shadow-black/10">Ya, Ubah</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}