import { useState, useEffect } from "react";
import ProfileCard from "./ProfileCard";
import { getProfile, updateProfile, logout, deleteAccount } from "@/src/lib/profile";
import LogoutConfirmModal from "./LogoutConfirmModal";
import { createPortal } from "react-dom";
import { useTheme } from "@/components/shared/ThemeProvider";

export default function ProfileModal({ isOpen, onClose, user }) {
  const [activeTab, setActiveTab] = useState("profile"); // "profile" | "personalisasi" | "keamanan"
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    personalContext: "",
    avatarChanged: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // SCROLL LOCK & ESC KEY
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      const handleEsc = (e) => {
        if (e.key === "Escape") onClose();
      };
      window.addEventListener("keydown", handleEsc);
      return () => {
        document.body.style.overflow = "auto";
        window.removeEventListener("keydown", handleEsc);
      };
    }
  }, [isOpen, onClose]);

  // LOAD DATA ONCE
  useEffect(() => {
    if (!isOpen) return;
    const load = async () => {
      try {
        const data = await getProfile();
        setProfileData({
          name: data.name || "",
          email: data.email || "",
          personalContext: data.personalContext || "",
          avatarChanged: false,
        });
      } catch (err) {
        setError(err.message);
      }
    };
    load();
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const handleSave = async (dataToSave) => {
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      await updateProfile(dataToSave);
      
      // Update local state and reset avatarChanged
      setProfileData(prev => ({ ...prev, ...dataToSave, avatarChanged: false }));

      // Sync to localStorage if name updated
      if (dataToSave.name) {
        const stored = JSON.parse(localStorage.getItem("user") || "{}");
        const updatedUser = { ...stored, name: dataToSave.name, nama: dataToSave.name };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        window.dispatchEvent(new Event("auth-change"));
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmLogout = async () => {
    setShowLogoutModal(false);
    onClose(); // Close settings
    await logout();
  };

  const menuItems = [
    { id: "profile", label: "Profile", icon: null },
    { id: "personalisasi", label: "Personalisasi", icon: null },
    { id: "tampilan", label: "Tampilan", icon: null },
    { id: "keamanan", label: "Keamanan", icon: null },
    { id: "akun", label: "Akun", icon: null },
  ];

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/20 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      >
        <div
          className="relative w-full max-w-4xl h-[90vh] md:h-[640px] bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] flex overflow-hidden animate-in zoom-in-95 duration-300 mx-4 transition-colors duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* CLOSE BUTTON */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 z-50 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-500 dark:text-gray-400 p-2 rounded-full transition-all active:scale-90"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>

          {/* SIDEBAR */}
          <div className="hidden md:flex w-64 bg-gray-50/50 dark:bg-slate-900/50 border-r border-gray-100 dark:border-slate-800 flex-col p-6 transition-colors duration-300">
            <div className="mb-8">
              <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Pengaturan</h2>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">TanyaHukum Account</p>
            </div>

            <nav className="flex-1 space-y-1.5">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  disabled={item.disabled}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all
                    ${item.disabled ? "opacity-30 cursor-not-allowed" : 
                      activeTab === item.id 
                      ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm border border-gray-100 dark:border-slate-700" 
                      : "text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-700 dark:hover:text-gray-300"}`}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Bottom Actions */}
            <div className="pt-6 border-t border-gray-100 dark:border-slate-800 space-y-4">
              <button
                onClick={() => setShowLogoutModal(true)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all group/logout active:scale-95"
              >
                <div className="text-red-500 group-hover/logout:scale-110 group-hover/logout:-translate-x-0.5 transition-all duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                </div>
                <span className="group-hover/logout:translate-x-0.5 transition-all duration-300">
                  Keluar Akun
                </span>
              </button>

              <div className="flex items-center gap-3 px-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center overflow-hidden border border-white dark:border-slate-800 shadow-sm">
                  {user?.avatarUrl ? <img src={user.avatarUrl} className="w-full h-full object-cover" /> : <span className="text-[10px]">👤</span>}
                </div>
                <div className="flex-1 truncate">
                  <p className="text-[10px] font-black text-gray-900 dark:text-gray-200 truncate">{user?.name || user?.nama || "User"}</p>
                  <p className="text-[8px] text-gray-400 truncate">{user?.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* CONTENT PANEL */}
          <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 overflow-y-auto custom-scrollbar transition-colors duration-300">
            <div className="p-10 max-w-2xl mx-auto w-full space-y-8">
              
              {activeTab === "profile" && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-1">Informasi Umum</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Kelola identitas dan detail kontak akun Anda.</p>
                  </div>

                  <ProfileCard 
                    user={user} 
                    onChange={() => setProfileData(prev => ({ ...prev, avatarChanged: true }))} 
                  />

                  <SectionGeneral 
                    data={profileData} 
                    onSave={handleSave} 
                    loading={loading}
                  />
                </div>
              )}

              {activeTab === "personalisasi" && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-1">Personalisasi AI</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Atur bagaimana AI berinteraksi dan memahami kebutuhan Anda.</p>
                  </div>

                  <SectionPersonalization 
                    data={profileData} 
                    onSave={handleSave} 
                    loading={loading}
                  />
                </div>
              )}

              {activeTab === "tampilan" && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-1">Tampilan</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Sesuaikan tema aplikasi sesuai kenyamanan mata Anda.</p>
                  </div>
                  <SectionAppearance />
                </div>
              )}

              {activeTab === "keamanan" && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-1">Keamanan</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Perbarui kata sandi Anda untuk menjaga keamanan akun.</p>
                  </div>

                  <SectionSecurity 
                    onSave={handleSave} 
                    loading={loading}
                  />
                </div>
              )}

              {activeTab === "akun" && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-1">Manajemen Akun</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Kelola pengaturan tingkat lanjut dan status akun Anda.</p>
                  </div>

                  <SectionAccount 
                    user={user} 
                    onDelete={async () => {
                      try {
                        setLoading(true);
                        await deleteAccount();
                      } catch (err) {
                        setError(err.message);
                      } finally {
                        setLoading(false);
                      }
                    }}
                  />
                </div>
              )}

              {/* FEEDBACK OVERLAY */}
              {(error || success) && (
                <div className="fixed bottom-10 right-10 z-[60] animate-in slide-in-from-bottom-4">
                  {error && (
                    <div className="bg-red-500 text-white px-6 py-3 rounded-2xl shadow-xl text-sm font-bold flex items-center gap-3">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                      {error}
                    </div>
                  )}
                  {success && (
                    <div className="bg-green-500 text-white px-6 py-3 rounded-2xl shadow-xl text-sm font-bold flex items-center gap-3">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                      Perubahan berhasil disimpan!
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* LOGOUT CONFIRMATION MODAL */}
      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleConfirmLogout}
      />
    </>,
    document.body
  );
}

// ==============================
// INTERNAL SECTION COMPONENTS
// ==============================

function SectionGeneral({ data, onSave, loading }) {
  const [val, setVal] = useState(data.name);

  useEffect(() => { setVal(data.name); }, [data.name]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Nama Lengkap</label>
        <input 
          value={val}
          onChange={(e) => setVal(e.target.value)}
          className="w-full px-5 py-4 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-gray-900 dark:text-white"
          placeholder="Nama Anda"
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Email (Terkunci)</label>
        <div className="relative">
          <input 
            value={data.email}
            readOnly
            className="w-full px-5 py-4 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-2xl text-gray-400 italic outline-none cursor-not-allowed"
          />
          <div className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          </div>
        </div>
      </div>

      <button 
        onClick={() => onSave({ name: val })}
        disabled={loading || (val === data.name && !data.avatarChanged)}
        className="px-8 py-4 bg-black dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold hover:opacity-80 transition-all active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center min-w-[200px]"
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-white/30 dark:border-slate-900/30 border-t-white dark:border-t-slate-900 rounded-full animate-spin"></div>
        ) : "Simpan Perubahan"}
      </button>
    </div>
  );
}

function SectionPersonalization({ data, onSave, loading }) {
  const [val, setVal] = useState(data.personalContext);

  useEffect(() => { setVal(data.personalContext); }, [data.personalContext]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Konteks Personal</label>
        <p className="text-xs text-gray-500 mb-4 leading-relaxed">
          Instruksi khusus ini akan diingat oleh AI setiap kali Anda memulai obrolan baru.
        </p>
        <textarea 
          value={val}
          onChange={(e) => setVal(e.target.value)}
          rows={6}
          className="w-full px-5 py-4 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-black/5 dark:focus:ring-white/5 focus:border-black dark:focus:border-white transition-all font-medium resize-none text-gray-900 dark:text-white"
          placeholder="Misal: Saya ingin jawaban yang ringkas dan profesional..."
        />
      </div>

      <button 
        onClick={() => onSave({ personalContext: val })}
        disabled={loading || val === data.personalContext}
        className="px-8 py-4 bg-black dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold hover:opacity-80 transition-all active:scale-[0.98] shadow-lg shadow-black/5 dark:shadow-white/5 disabled:opacity-30 flex items-center justify-center min-w-[200px]"
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-white/30 dark:border-slate-900/30 border-t-white dark:border-t-slate-900 rounded-full animate-spin"></div>
        ) : "Simpan Preferensi AI"}
      </button>
    </div>
  );
}

function SectionSecurity({ onSave, loading }) {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // ENSURE EMPTY ON MOUNT
  useEffect(() => {
    setForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleInitialSubmit = () => {
    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      setError("Semua field wajib diisi");
      return;
    }

    if (form.newPassword.length < 8) {
      setError("Password baru minimal 8 karakter");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setError("Konfirmasi password tidak cocok");
      return;
    }

    setShowConfirmModal(true);
  };

  const handleConfirmedSave = async () => {
    setShowConfirmModal(false);
    await onSave({ 
      currentPassword: form.currentPassword,
      newPassword: form.newPassword 
    });
    
    // Clear form on success
    setForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  return (
    <>
      <div className="space-y-6 max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* CURRENT PASSWORD */}
        <div className="space-y-2">
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Kata Sandi Saat Ini</label>
          <div className="relative">
            <input 
              type={showCurrent ? "text" : "password"}
              name="currentPassword"
              value={form.currentPassword}
              onChange={handleChange}
              autoComplete="new-password"
              className="w-full px-5 py-4 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-black/5 dark:focus:ring-white/5 focus:border-black dark:focus:border-white transition-all font-medium pr-12 text-gray-900 dark:text-white"
              placeholder="••••••••"
            />
            <button 
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              {showCurrent ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 19c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              )}
            </button>
          </div>
        </div>

        {/* NEW PASSWORD */}
        <div className="space-y-2">
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Kata Sandi Baru</label>
          <div className="relative">
            <input 
              type={showNew ? "text" : "password"}
              name="newPassword"
              value={form.newPassword}
              onChange={handleChange}
              autoComplete="new-password"
              className="w-full px-5 py-4 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-black/5 dark:focus:ring-white/5 focus:border-black dark:focus:border-white transition-all font-medium pr-12 text-gray-900 dark:text-white"
              placeholder="••••••••"
            />
            <button 
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              {showNew ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 19c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              )}
            </button>
          </div>
        </div>

        {/* CONFIRM PASSWORD */}
        <div className="space-y-2">
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Konfirmasi Kata Sandi Baru</label>
          <div className="relative">
            <input 
              type={showConfirm ? "text" : "password"}
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
              className="w-full px-5 py-4 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl outline-none focus:ring-4 focus:ring-black/5 dark:focus:ring-white/5 focus:border-black dark:focus:border-white transition-all font-medium pr-12 text-gray-900 dark:text-white"
              placeholder="••••••••"
            />
            <button 
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              {showConfirm ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 19c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              )}
            </button>
          </div>
        </div>

        {error && (
          <p className="text-xs font-bold text-red-500 animate-shake">{error}</p>
        )}

        <button 
          onClick={handleInitialSubmit}
          disabled={loading}
          className="px-8 py-4 bg-black dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold hover:opacity-80 transition-all active:scale-[0.98] shadow-lg shadow-black/5 dark:shadow-white/5 disabled:opacity-30 flex items-center justify-center min-w-[200px]"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 dark:border-slate-900/30 border-t-white dark:border-t-slate-900 rounded-full animate-spin"></div>
          ) : "Ubah Password"}
        </button>
      </div>

      {/* CONFIRMATION MODAL */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowConfirmModal(false)} />
          <div className="relative bg-white dark:bg-slate-900 rounded-[2rem] p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-300">
             <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">Konfirmasi Ubah Password</h3>
             <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-8">
               Apakah Anda yakin ingin mengubah kata sandi Anda? Anda perlu masuk kembali jika sesi berakhir.
             </p>
             <div className="flex gap-3">
               <button 
                 onClick={() => setShowConfirmModal(false)}
                 className="flex-1 px-4 py-3 bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-slate-700 transition-all"
               >
                 Batal
               </button>
               <button 
                 onClick={handleConfirmedSave}
                 className="flex-1 px-4 py-3 bg-black dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold hover:opacity-80 transition-all shadow-lg shadow-black/10"
               >
                 Ya, Ubah
               </button>
             </div>
          </div>
        </div>
      )}
    </>
  );
}

function SectionAppearance() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="space-y-6">
      <div className="p-6 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-3xl transition-colors duration-300">
        <h4 className="text-sm font-black text-gray-900 dark:text-white mb-4">Tema Aplikasi</h4>
        
        <div className="flex bg-white dark:bg-slate-900 p-1 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm transition-colors duration-300">
          <button
            onClick={() => toggleTheme("light")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all ${
              theme === "light" 
                ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 shadow-sm" 
                : "text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-800"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path></svg>
            Terang
          </button>
          <button
            onClick={() => toggleTheme("dark")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all ${
              theme === "dark" 
                ? "bg-slate-800 text-white shadow-sm" 
                : "text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-800"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path></svg>
            Gelap
          </button>
        </div>
        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-4 leading-relaxed font-medium uppercase tracking-wider">
          Pilih tema gelap untuk mengurangi ketegangan mata saat membaca dokumen hukum yang panjang.
        </p>
      </div>
    </div>
  );
}

function SectionAccount({ user, onDelete }) {
  const [step, setStep] = useState(0); // 0: section, 1: first confirm, 2: final confirm
  const [confirmText, setConfirmText] = useState("");
  const isCorrect = confirmText === "HAPUS";

  const reset = () => {
    setStep(0);
    setConfirmText("");
  };

  return (
    <>
      <div className="space-y-6">
        <div className="p-8 border-2 border-red-100 dark:border-red-900/20 bg-red-50/30 dark:bg-red-900/5 rounded-[2rem] transition-all">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center text-red-600 shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
            </div>
            <div>
              <h4 className="text-lg font-black text-gray-900 dark:text-white mb-1">Zona Berbahaya</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
                Menghapus akun Anda adalah tindakan permanen. Seluruh data obrolan, riwayat transaksi, dan profil akan dihapus selamanya dari sistem kami.
              </p>
              <button
                onClick={() => setStep(1)}
                className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-red-200 dark:shadow-red-900/20 transition-all active:scale-95"
              >
                Hapus Akun Saya
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* STEP 1: INITIAL WARNING */}
      {step === 1 && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={reset} />
          <div className="relative bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-300 border border-gray-100 dark:border-slate-800">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center text-red-600 mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            </div>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-4">Apakah Anda yakin?</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-8">
              Anda akan kehilangan akses ke seluruh layanan <span className="font-bold text-gray-900 dark:text-white">TanyaHukum</span>. Tindakan ini tidak dapat dibatalkan atau dikembalikan.
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => setStep(2)}
                className="w-full px-6 py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-bold transition-all shadow-lg shadow-red-200 dark:shadow-red-900/20 active:scale-95"
              >
                Saya Mengerti, Lanjutkan
              </button>
              <button 
                onClick={reset}
                className="w-full px-6 py-4 bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-gray-400 rounded-2xl font-bold hover:bg-gray-100 dark:hover:bg-slate-700 transition-all"
              >
                Batalkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: FINAL INTENTIONAL CONFIRMATION */}
      {step === 2 && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={reset} />
          <div className="relative bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-300 border border-red-200 dark:border-red-900/30">
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Konfirmasi Terakhir</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-8">
              Ketik kata <span className="font-black text-red-500 underline uppercase tracking-widest">HAPUS</span> di bawah ini untuk mengonfirmasi penghapusan akun secara permanen.
            </p>
            
            <div className="space-y-6">
              <input 
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                placeholder="Ketik HAPUS"
                className="w-full px-6 py-4 bg-red-50/50 dark:bg-red-900/10 border-2 border-red-100 dark:border-red-900/20 rounded-2xl outline-none focus:border-red-500 text-center font-black tracking-widest text-red-600 placeholder:text-red-200 dark:placeholder:text-red-900/40 transition-all"
              />

              <div className="flex gap-3">
                <button 
                  onClick={reset}
                  className="flex-1 px-4 py-4 bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-gray-400 rounded-2xl font-bold hover:bg-gray-100 dark:hover:bg-slate-700 transition-all"
                >
                  Batal
                </button>
                <button 
                  disabled={!isCorrect}
                  onClick={onDelete}
                  className="flex-[2] px-4 py-4 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-200 dark:shadow-red-900/20 active:scale-95 disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed"
                >
                  Hapus Permanen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}