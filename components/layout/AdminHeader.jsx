"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminHeader() {
  const router = useRouter(); // Masih disimpan kalau-kalau fitur di sebelah kanan butuh router
  const pathname = usePathname();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      setUser(JSON.parse(stored));
    }
  }, []);

  const getHeaderInfo = () => {
    // 1. Cek Halaman Profile
    if (pathname?.includes("/profile")) return { title: "Profil Admin", icon: "/icons/profile.svg" };
    
    // 2. Cek Halaman Lainnya
    if (pathname?.includes("/data")) return { title: "Pusat Data Hukum", icon: "/icons/pusatDataSidebar.svg" };
    if (pathname?.includes("/manage-user")) return { title: "Manage User", icon: "/icons/manageUser.svg" };
    
    // 3. Default jika tidak ada yang cocok
    return { title: "Dashboard Statistik", icon: "/icons/dashboardStatistik.svg" }; 
  };

  const { title, icon } = getHeaderInfo();

  return (
    <div className="w-full flex items-center justify-between px-4 py-3">
      
      {/* LEFT (Sekarang murni hanya teks dan icon, tidak bisa diklik) */}
      <div className="flex items-center gap-3">
        <img src={icon} className="w-8 h-8 object-contain" />
        <h1 className="text-lg font-semibold text-gray-900">
          {title}
        </h1>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-3">
        {/* PROFILE/LOGOUT LOGIC */}
        {user && (
          <div className="flex items-center gap-3 px-2 cursor-pointer hover:bg-blue-50 rounded-xl p-2 transition">
            <img src="/icons/profile.svg" className="w-9 h-9" />
            <div className="hidden md:block">
              <p className="text-sm font-medium text-gray-900">Admin</p>
              <p className="text-xs text-gray-500">Superuser</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}