import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
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
            id: "keamanan",
            label: "Keamanan",
        }
    ];

    return createPortal(
        <>
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/20 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose}>
                <div className="relative w-full max-w-4xl h-[90vh] md:h-[640px] bg-white rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] flex overflow-hidden animate-in zoom-in-95 duration-300 mx-4" onClick={(e) => e.stopPropagation()}>

                    <button onClick={onClose} className="absolute top-6 right-6 z-50 bg-gray-100 hover:bg-gray-200 text-gray-500 p-2 rounded-full transition-all active:scale-90">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>

                    <div className="hidden md:flex w-64 bg-gray-50/50 border-r border-gray-100 flex flex-col p-6">
                        <div className="mb-8">
                            <h2 className="text-xl font-black text-gray-900 tracking-tight">Pengaturan</h2>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Admin TanyaHukum</p>
                        </div>

                        <nav className="flex-1 space-y-1.5">
                            {menuItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeTab === item.id ? "bg-white text-blue-600 shadow-sm border border-gray-100" : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"}`}
                                >
                                    {item.icon}
                                    {item.label}
                                </button>
                            ))}
                        </nav>

                        <div className="pt-6 border-t border-gray-100 space-y-4">
                            <button onClick={() => setShowLogoutModal(true)} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all active:scale-95">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                                Keluar Akun
                            </button>

                            <div className="flex items-center gap-3 px-2">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden border border-white shadow-sm">
                                    {userData?.avatarUrl ? <img src={userData.avatarUrl} className="w-full h-full object-cover" /> : <img src="/icons/profile.svg" className="w-5 h-5 opacity-60" />}
                                </div>
                                <div className="flex-1 truncate">
                                    <p className="text-[10px] font-black text-gray-900 truncate">{userData?.nama || userData?.name || "Admin"}</p>
                                    <p className="text-[8px] text-gray-400 truncate">{userData?.email}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col bg-white overflow-y-auto custom-scrollbar">
                        <div className="p-10 max-w-2xl mx-auto w-full space-y-8 mt-4">

                            {activeTab === "profile" && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div>
                                        <h3 className="text-2xl font-black text-gray-900 mb-1">Informasi Profile</h3>
                                        <p className="text-sm text-gray-500">Kelola foto, nama, dan alamat email admin Anda.</p>
                                    </div>

                                    <AdminProfileCard userData={userData} updateLocalUser={updateLocalUser} />
                                    <AdminProfileForm activeTab="profile" userData={userData} updateLocalUser={updateLocalUser} />
                                </div>
                            )}

                            {activeTab === "keamanan" && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div>
                                        <h3 className="text-2xl font-black text-gray-900 mb-1">Keamanan</h3>
                                        <p className="text-sm text-gray-500">Perbarui kata sandi untuk menjaga keamanan akun admin Anda.</p>
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
