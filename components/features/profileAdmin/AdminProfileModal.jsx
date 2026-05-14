import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useTheme } from "@/components/shared/ThemeProvider";
import AdminProfileCard from "./AdminProfileCard";
import AdminProfileForm from "./AdminProfileForm";
import LogoutConfirmModal from "../profile/LogoutConfirmModal";

export default function AdminProfileModal({ isOpen, onClose, userData, updateLocalUser }) {
    const [activeTab, setActiveTab] = useState("profile");
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    // Lock scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
            return () => {
                document.body.style.overflow = "auto";
            };
        }
    }, [isOpen]);

    if (!isOpen || !mounted) return null;

    const handleConfirmLogout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        window.location.href = "/chatbot";
    };

    const menuItems = [
        {
            id: "profile",
            label: "Profile",
        },
        {
            id: "tampilan",
            label: "Tampilan",
        },
        {
            id: "keamanan",
            label: "Keamanan",
        }
    ];

    return createPortal(
        <>
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/20 backdrop-blur-md animate-in fade-in duration-300 transition-colors" onClick={onClose}>
                <div className="relative w-full max-w-4xl h-[90vh] md:h-[640px] bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] flex overflow-hidden animate-in zoom-in-95 duration-300 mx-4 transition-colors duration-300" onClick={(e) => e.stopPropagation()}>

                    <button onClick={onClose} className="absolute top-6 right-6 z-50 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-500 dark:text-gray-400 p-2 rounded-full transition-all active:scale-90">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>

                    <div className="hidden md:flex w-64 bg-gray-50/50 dark:bg-slate-900/50 border-r border-gray-100 dark:border-slate-800 flex-col p-6 transition-colors duration-300">
                        <div className="mb-8">
                            <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight transition-colors">Pengaturan</h2>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Admin TanyaHukum</p>
                        </div>

                        <nav className="flex-1 space-y-1.5">
                            {menuItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                                        activeTab === item.id 
                                        ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm border border-gray-100 dark:border-slate-700" 
                                        : "text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-700 dark:hover:text-gray-300"
                                    }`}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </nav>

                        <div className="pt-6 border-t border-gray-100 dark:border-slate-800 space-y-4 transition-colors duration-300">
                            <button onClick={() => setShowLogoutModal(true)} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all active:scale-95">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                                Keluar Akun
                            </button>

                            <div className="flex items-center gap-3 px-2">
                                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center overflow-hidden border border-white dark:border-slate-800 shadow-sm transition-colors duration-300">
                                    {userData?.avatarUrl ? <img src={userData.avatarUrl} className="w-full h-full object-cover" /> : <img src="/icons/profile.svg" className="w-5 h-5 opacity-60" />}
                                </div>
                                <div className="flex-1 truncate">
                                    <p className="text-[10px] font-black text-gray-900 dark:text-gray-200 truncate transition-colors">{userData?.nama || userData?.name || "Admin"}</p>
                                    <p className="text-[8px] text-gray-400 truncate">{userData?.email}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 overflow-y-auto custom-scrollbar transition-colors duration-300">
                        <div className="p-10 max-w-2xl mx-auto w-full space-y-8 mt-4">

                            {activeTab === "profile" && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div>
                                        <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-1 transition-colors">Informasi Profile</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Kelola foto, nama, dan alamat email admin Anda.</p>
                                    </div>

                                    <AdminProfileCard userData={userData} updateLocalUser={updateLocalUser} />
                                    <AdminProfileForm activeTab="profile" userData={userData} updateLocalUser={updateLocalUser} />
                                </div>
                            )}

                            {activeTab === "tampilan" && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div>
                                        <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-1 transition-colors">Tampilan</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Sesuaikan tema dashboard admin sesuai kenyamanan Anda.</p>
                                    </div>
                                    <SectionAppearance />
                                </div>
                            )}

                            {activeTab === "keamanan" && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div>
                                        <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-1 transition-colors">Keamanan</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Perbarui kata sandi untuk menjaga keamanan akun admin Anda.</p>
                                    </div>

                                    <AdminProfileForm activeTab="keamanan" userData={userData} updateLocalUser={updateLocalUser} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <LogoutConfirmModal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)} onConfirm={handleConfirmLogout} />
        </>,
        document.body
    );
}

function SectionAppearance() {
    const { theme, toggleTheme } = useTheme();
  
    return (
      <div className="space-y-6">
        <div className="p-6 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-3xl transition-colors duration-300">
          <h4 className="text-sm font-black text-gray-900 dark:text-white mb-4 transition-colors">Tema Dashboard</h4>
          
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
          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-4 leading-relaxed font-medium uppercase tracking-wider transition-colors">
            Sesuaikan kenyamanan visual Anda saat mengelola data hukum dan administrasi platform.
          </p>
        </div>
      </div>
    );
}
