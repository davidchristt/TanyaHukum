import { useRouter, usePathname } from "next/navigation";

export default function AdminHeader() {
  const router = useRouter(); 
  const pathname = usePathname();

  const getHeaderInfo = () => {
    if (pathname?.includes("/profile")) return { title: "Profil Admin", icon: "/icons/profile.svg" };
    if (pathname?.includes("/data")) return { title: "Pusat Data Hukum", icon: "/icons/pusatDataSidebar.svg" };
    if (pathname?.includes("/manage-user")) return { title: "Manage User", icon: "/icons/manageUser.svg" };
    
    return { title: "Dashboard Statistik", icon: "/icons/dashboardStatistik.svg" }; 
  };

  const { title, icon } = getHeaderInfo();

  return (
    <div className="w-full flex items-center justify-between px-4 py-3 h-20 transition-all">
      
      {/* LEFT - Identity Section */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center border border-blue-100 dark:border-blue-800 shadow-sm transition-all">
          <img src={icon} className="w-6 h-6 object-contain transition-all" alt="icon" />
        </div>
        <div>
          <h1 className="text-lg font-black text-gray-900 dark:text-white tracking-tight leading-none mb-1 transition-colors">
            {title}
          </h1>
          <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] transition-colors">Panel Administrasi</p>
        </div>
      </div>

      {/* RIGHT - Actions Section (Optional placeholder if needed in future) */}
      <div className="flex items-center gap-3">
        {/* Profile removed to prevent redundancy with Sidebar footer */}
      </div>
    </div>
  );
}