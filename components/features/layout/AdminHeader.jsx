"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminHeader() {
    const pathname = usePathname();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const loadUser = () => {
            const stored = localStorage.getItem("user");
            if (stored) {
                setUser(JSON.parse(stored));
            }
        };

        // Muat saat pertama kali halaman dibuka
        loadUser();

        // 1. Dengarkan jika ada perubahan dari tab lain (Bawaan browser)
        window.addEventListener("storage", loadUser);

        // 2. Dengarkan sinyal khusus jika ada perubahan di tab ini (Custom Event)
        window.addEventListener("auth-change", loadUser);

        return () => {
            window.removeEventListener("storage", loadUser);
            window.removeEventListener("auth-change", loadUser);
        };
    }, []);

    const getHeaderInfo = () => {
        if (pathname?.includes("/data")) return { title: "Pusat Data Hukum", icon: "/icons/pusatDataSidebar.svg" };
        if (pathname?.includes("/manage-user")) return { title: "Manage User", icon: "/icons/manageUser.svg" };

        return { title: "Dashboard Statistik", icon: "/icons/dashboardStatistik.svg" };
    };

    const { title, icon } = getHeaderInfo();

    return (
        <div className="w-full flex items-center justify-between px-4 py-3">

            {/* LEFT */}
            <div className="flex items-center gap-3">
                <img src={icon} className="w-8 h-8 object-contain" alt="icon" />
                <h1 className="text-lg font-semibold text-gray-900">
                    {title}
                </h1>
            </div>

            {/* RIGHT */}
            <div className="flex items-center gap-3">
                {user && (
                    <div className="flex items-center gap-3 px-2 rounded-xl p-2 transition">
                        {/* Dinamis cek foto profil */}
                        <img
                            src={user.avatarUrl || "/icons/profile.svg"}
                            className={`w-9 h-9 shrink-0 ${user.avatarUrl ? "rounded-full object-cover border border-gray-200" : "object-contain opacity-60"}`}
                            alt="Profile"
                        />
                        <div className="hidden md:block">
                            {/* Dinamis cek nama */}
                            <p className="text-sm font-bold text-gray-900">
                                {user.nama || user.name || "Admin"}
                            </p>
                            <p className="text-xs font-medium text-blue-500">Superuser</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}