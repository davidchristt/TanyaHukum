"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminHeader() {
  const router = useRouter(); 
  const pathname = usePathname();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      setUser(JSON.parse(stored));
    }
    
    // Opsional: Biar header ikut ke-update kalau ada perubahan di localStorage
    const handleStorageChange = () => {
      const updatedUser = localStorage.getItem("user");
      if (updatedUser) setUser(JSON.parse(updatedUser));
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const getHeaderInfo = () => {
    if (pathname?.includes("/profile")) return { title: "Profil Admin", icon: "/icons/profile.svg" };
    if (pathname?.includes("/data")) return { title: "Pusat Data Hukum", icon: "/icons/pusatDataSidebar.svg" };
    if (pathname?.includes("/manage-user")) return { title: "Manage User", icon: "/icons/manageUser.svg" };
    
    return { title: "Dashboard Statistik", icon: "/icons/dashboardStatistik.svg" }; 
  };

  const { title, icon } = getHeaderInfo();

  return (
    <div className="w-full flex items-center justify-between px-4 py-3">
      
      {/* LEFT */}
      <div className="flex items-center gap-3">
        <img src={icon} className="w-8 h-8 object-contain" />
        <h1 className="text-lg font-semibold text-gray-900">
          {title}
        </h1>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-3">
        {/* PROFILE LOGIC */}
        {user && (
          <div 
            onClick={() => router.push("/admin/profile")}
            className="flex items-center gap-3 px-2 cursor-pointer hover:bg-blue-50 rounded-xl p-2 transition"
          >
            {/* Dinamis cek foto profil */}
            <img 
              src={user.avatarUrl || "/icons/profile.svg"} 
              className={`w-9 h-9 shrink-0 ${user.avatarUrl ? "rounded-full object-cover" : "object-contain opacity-60"}`} 
              alt="Profile"
            />
            <div className="hidden md:block">
              {/* Dinamis cek nama */}
              <p className="text-sm font-medium text-gray-900">
                {user.nama || user.name || "Admin"}
              </p>
              <p className="text-xs text-gray-500">Superuser</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}