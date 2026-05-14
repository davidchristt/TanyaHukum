"use client";

import { useState, useEffect } from "react";

export default function AdminUserModal({ onClose, onSave, initialData }) {
  const isEdit = !!initialData;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "USER",
    tier: "FREE",
    promptLimit: 50,
  });

  const [errors, setErrors] = useState({});
  const [isConfirming, setIsConfirming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        email: initialData.email || "",
        password: "",
        role: initialData.role || "USER",
        tier: initialData.tier || "FREE",
        promptLimit: initialData.promptLimit || 50,
      });
    }
  }, [initialData]);

  // Logic: ADMIN must be PRO and UNLIMITED
  useEffect(() => {
    if (formData.role === "ADMIN") {
      setFormData(prev => ({ 
        ...prev, 
        tier: "PRO", 
        promptLimit: 0 
      }));
    }
  }, [formData.role]);

  // Logic: PRO must be UNLIMITED
  useEffect(() => {
    if (formData.tier === "PRO" && formData.promptLimit !== 0) {
      setFormData(prev => ({ ...prev, promptLimit: 0 }));
    }
  }, [formData.tier]);

  const validate = () => {
    const newErrors = {};
    if (!isEdit) {
      if (!formData.name.trim()) newErrors.name = "Wajib diisi";
      if (!formData.email.trim()) newErrors.email = "Wajib diisi";
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Format invalid";
      if (!formData.password) newErrors.password = "Wajib diisi";
      else if (formData.password.length < 6) newErrors.password = "Min 6 karakter";
    }
    return newErrors;
  };

  const handlePreSubmit = (e) => {
    e.preventDefault();
    const valErrors = validate();
    if (Object.keys(valErrors).length > 0) {
      setErrors(valErrors);
      return;
    }
    setIsConfirming(true);
  };

  const handleFinalSave = async () => {
    setIsLoading(true);
    setFeedback(null);
    try {
      await onSave({
        ...formData,
        role: formData.role,
        promptLimit: parseInt(formData.promptLimit),
      });
      setFeedback({ type: 'success', message: isEdit ? 'Berhasil diperbarui!' : 'Berhasil didaftarkan!' });
      setTimeout(() => onClose(), 1200);
    } catch (error) {
      setFeedback({ type: 'error', message: error.message || 'Gagal memproses.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/20 backdrop-blur-md animate-fadeIn p-4 overflow-y-auto custom-scrollbar">
      
      {/* MAIN FORM MODAL */}
      {!isConfirming ? (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] w-full max-w-[640px] transform transition-all animate-slideUp border border-gray-100 dark:border-slate-800 transition-colors">
          
          <div className="flex items-center gap-4 mb-8">
            <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight transition-colors">
              {isEdit ? "Konfigurasi User" : "Tambah User"}
            </h2>
          </div>
          
          <form onSubmit={handlePreSubmit} className="space-y-5">
            
            {/* ROW 1: NAME & EMAIL */}
            {!isEdit && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1 transition-colors">Nama Lengkap</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl p-3 text-sm font-bold text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-500/10 outline-none transition transition-colors"
                    placeholder="Contoh: Arvin Syah"
                  />
                  {errors.name && <p className="text-[9px] font-bold text-red-500 ml-1 italic">{errors.name}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1 transition-colors">Email Utama</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl p-3 text-sm font-bold text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-500/10 outline-none transition transition-colors"
                    placeholder="email@example.com"
                  />
                  {errors.email && <p className="text-[9px] font-bold text-red-500 ml-1 italic">{errors.email}</p>}
                </div>
              </div>
            )}

            {/* ROW 2: PASSWORD (Only for New User) */}
            {!isEdit && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1 transition-colors">Password Akses</label>
                <input 
                  type="password" 
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl p-3 text-sm font-bold text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-500/10 outline-none transition transition-colors"
                  placeholder="Masukkan sandi minimal 6 karakter..."
                />
                {errors.password && <p className="text-[9px] font-bold text-red-500 ml-1 italic">{errors.password}</p>}
              </div>
            )}

            {/* ROW 3: ROLE & TIER */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1 transition-colors">Otoritas Role</label>
                <div className="flex gap-2 p-1 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-100 dark:border-slate-800 transition-colors">
                  {['USER', 'ADMIN'].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setFormData({ ...formData, role: r })}
                      className={`flex-1 py-2.5 rounded-lg text-[9px] font-black transition-all ${
                        formData.role === r 
                          ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm border border-gray-100 dark:border-slate-800" 
                          : "text-gray-400 dark:text-gray-500 hover:bg-gray-100/50 dark:hover:bg-slate-800/50"
                      }`}
                    >
                      {r === 'ADMIN' ? 'ADMINISTRATOR' : 'REGULAR USER'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest transition-colors">Subscription</label>
                  {formData.role === "ADMIN" && (
                    <span className="text-[8px] font-black text-blue-500 dark:text-blue-400 uppercase tracking-tight transition-colors">Auto PRO</span>
                  )}
                </div>
                <div className="flex gap-2 p-1 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-100 dark:border-slate-800 transition-colors">
                  {['FREE', 'PRO'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      disabled={formData.role === "ADMIN"}
                      onClick={() => setFormData({ ...formData, tier: t })}
                      className={`flex-1 py-2.5 rounded-lg text-[9px] font-black transition-all ${
                        formData.tier === t 
                          ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm border border-gray-100 dark:border-slate-800" 
                          : "text-gray-400 dark:text-gray-500 hover:bg-gray-100/50 dark:hover:bg-slate-800/50 disabled:opacity-30"
                      }`}
                    >
                      {t} MEMBER
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ROW 4: PROMPT LIMIT */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between px-1">
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest transition-colors">Limitasi Harian</label>
                {formData.tier === "PRO" && (
                  <span className="text-[8px] font-black text-emerald-500 dark:text-emerald-400 uppercase tracking-widest transition-colors">Unlimited Member Access</span>
                )}
              </div>
              <div className="relative group">
                <input 
                  type={formData.tier === "PRO" ? "text" : "number"} 
                  value={formData.tier === "PRO" ? "UNLIMITED ACCESS" : formData.promptLimit}
                  onChange={(e) => setFormData({ ...formData, promptLimit: e.target.value })}
                  disabled={formData.tier === "PRO"}
                  className={`w-full border rounded-xl p-3.5 text-xs font-black outline-none transition ${
                    formData.tier === "PRO" 
                      ? "bg-emerald-50/20 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 cursor-not-allowed" 
                      : "bg-gray-50 dark:bg-slate-800 border-gray-100 dark:border-slate-700 text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-500/10 group-hover:bg-white dark:group-hover:bg-slate-700"
                  } transition-colors`}
                />
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                  <span className={`text-[9px] font-black px-2 py-1 rounded-md transition-colors ${
                    formData.tier === "PRO" ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" : "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                  }`}>
                    {formData.tier === "PRO" ? "MAX" : "MSG / DAY"}
                  </span>
                </div>
              </div>
            </div>

            {/* BUTTONS */}
            <div className="pt-6 grid grid-cols-2 gap-3">
              <button 
                type="button"
                onClick={onClose}
                className="w-full bg-gray-50 dark:bg-slate-800 text-gray-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-widest hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700 transition py-4 rounded-xl active:scale-95 transition-colors"
              >
                Batalkan
              </button>
              <button 
                type="submit"
                className="w-full bg-gray-900 dark:bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-black dark:hover:bg-blue-700 transition py-4 rounded-xl shadow-lg active:scale-95 transition-all"
              >
                {isEdit ? "Update Parameter" : "Daftarkan User"}
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* CONFIRMATION POPUP (Stay consistent with current style) */
        <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] w-full max-w-[420px] text-center transform transition-all animate-slideUp border border-gray-100 dark:border-slate-800 transition-colors">
          {feedback ? (
            <div className="py-6 animate-fadeIn">
              <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 transition-colors ${
                feedback.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/10 text-emerald-500 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30' : 'bg-red-50 dark:bg-red-900/10 text-red-500 dark:text-red-400 border border-red-100 dark:border-red-900/30'
              }`}>
                {feedback.type === 'success' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                )}
              </div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2 transition-colors">{feedback.type === 'success' ? 'Berhasil!' : 'Gagal'}</h3>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors">{feedback.message}</p>
            </div>
          ) : (
            <>
              <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-blue-100 dark:border-blue-900/30 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 dark:text-blue-400"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              </div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-3 tracking-tight transition-colors">
                {isEdit ? "Konfirmasi Update" : "Konfirmasi User Baru"}
              </h2>
              <div className="bg-gray-50 dark:bg-slate-800/50 rounded-2xl p-6 mb-8 text-left space-y-4 border border-gray-100 dark:border-slate-800 transition-colors">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest transition-colors">Otoritas</span>
                  <span className="text-xs font-bold text-gray-900 dark:text-white transition-colors">{formData.role}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest transition-colors">Subscription</span>
                  <span className="text-xs font-bold text-gray-900 dark:text-white transition-colors">{formData.tier} Member</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest transition-colors">Quota Limit</span>
                  <span className={`text-xs font-bold transition-colors ${formData.tier === "PRO" ? "text-emerald-600 dark:text-emerald-400" : "text-blue-600 dark:text-blue-400"}`}>
                    {formData.tier === "PRO" ? "Unlimited Access" : `${formData.promptLimit} MSG/Day`}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleFinalSave}
                  disabled={isLoading}
                  className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl hover:bg-blue-700 transition shadow-xl shadow-blue-100 dark:shadow-blue-900/20 active:scale-95 flex items-center justify-center gap-3 transition-all"
                >
                  {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Simpan Perubahan"}
                </button>
                <button 
                  onClick={() => setIsConfirming(false)}
                  disabled={isLoading}
                  className="w-full text-gray-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-widest hover:text-gray-600 dark:hover:text-white transition py-2 transition-all"
                >
                  Kembali
                </button>
              </div>
            </>
          )}
        </div>
      )}

    </div>
  );
}