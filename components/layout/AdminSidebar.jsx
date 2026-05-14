import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";

/* ===== MENU CONFIG ===== */
const MENU_ADMIN = [
  {
    label: "Dashboard Statistik",
    icon: "/icons/dashboardStatistik.svg",
    path: "/admin",
  },
  {
    label: "Pusat Data Hukum",
    icon: "/icons/pusatDataSidebar.svg",
    path: "/admin/data",
  },
  {
    label: "Manage User",
    icon: "/icons/manageUser.svg",
    path: "/admin/manage-user",
  },
];

export default function AdminSidebar({ isOpen, setIsOpen, onOpenProfile }) {
  const router = useRouter();
  const pathname = usePathname();
  
  // <-- STATE UNTUK MENYIMPAN USER -->
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = () => {
      const stored = localStorage.getItem("user");
      if (stored) setUser(JSON.parse(stored));
    };
    
    loadUser();
    window.addEventListener("storage", loadUser);
    window.addEventListener("auth-change", loadUser);
    
    return () => {
      window.removeEventListener("storage", loadUser);
      window.removeEventListener("auth-change", loadUser);
    };
  }, []);

  return (
    <div
      className={`relative z-10 h-full bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-white/20 dark:border-slate-800
      flex flex-col justify-between transition-all duration-300 
      ${isOpen ? "w-64" : "w-20 items-center"}`}
    >
      {/* TOP */}
      <div className="w-full">
        
        {/* ===== HEADER ===== */}
        {isOpen ? (
          <div className="flex items-center justify-between mb-6">
            <img src="/icons/logo.svg" className="w-14 h-14" alt="logo" />

            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-lg border border-blue-300 dark:border-blue-900/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
            >
              <img src="/icons/sidebar.svg" className="w-5 h-5 transition-all" alt="toggle" />
            </button>
          </div>
        ) : (
          <div className="flex justify-center mb-6">
            <div className="relative group/logo">
              <img src="/icons/logo.svg" className="w-14 h-14" alt="logo" />
              <button
                onClick={() => setIsOpen(true)}
                className="absolute inset-0 flex items-center justify-center 
                opacity-0 group-hover/logo:opacity-100 transition z-50
                rounded-lg bg-white/90 dark:bg-slate-800/90 border border-blue-300 dark:border-blue-900/50"
              >
                <img src="/icons/sidebar.svg" className="w-5 h-5 transition-all" alt="toggle" />
              </button>
            </div>
          </div>
        )}

        {/* ===== MENU ===== */}
        <div className="space-y-3">
          {MENU_ADMIN.map((item) => (
            <AdminMenuItem
              key={item.path}
              icon={item.icon}
              label={item.label}
              isOpen={isOpen}
              isActive={pathname === item.path}
              onClick={() => router.push(item.path)}
            />
          ))}
        </div>
      </div>

      {/* ===== PROFILE ===== */}
      <div
        onClick={onOpenProfile}
        className={`flex items-center ${
          isOpen ? "gap-3 px-2" : "justify-center"
        } cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl p-2 transition-all`}
      >
        <img 
          src={user?.avatarUrl || "/icons/profile.svg"} 
          className={`w-9 h-9 shrink-0 ${user?.avatarUrl ? "rounded-full object-cover border border-gray-200 dark:border-slate-700" : "object-contain opacity-60 transition-all"}`} 
          alt="Profile"
        />

        {isOpen && (
          <div className="overflow-hidden">
            <p className="text-sm font-black text-gray-900 dark:text-white truncate transition-colors">
              {user?.nama || user?.name || "Admin"}
            </p>
            <p className="text-xs font-bold text-blue-500 dark:text-blue-400">Superuser</p>
          </div>
        )}
      </div>
    </div>
  );
}

function AdminMenuItem({ icon, label, isOpen, isActive, onClick }) {
  return (
    <div className="relative group/item">
      <button
        onClick={onClick}
        className={`w-full flex items-center ${
          isOpen ? "justify-start px-3" : "justify-center"
        } gap-3 py-3 border rounded-xl transition-all
        ${
          isActive
            ? "border-blue-600 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-sm"
            : "border-transparent hover:bg-blue-50 dark:hover:bg-slate-800/50 hover:border-blue-200 dark:hover:border-slate-700"
        }`}
      >
        <img
          src={icon}
          className={`w-5 h-5 object-contain bg-transparent transition-all ${isActive ? "" : "opacity-60"}`}
          alt={label}
        />
        {isOpen && <span className={`text-sm font-bold transition-colors ${isActive ? "text-blue-700 dark:text-blue-400" : "text-gray-600 dark:text-gray-400"}`}>{label}</span>}
      </button>

      {!isOpen && (
        <span className="absolute left-14 top-1/2 -translate-y-1/2 
        opacity-0 group-hover/item:opacity-100 pointer-events-none transition z-50
        bg-gray-900 dark:bg-slate-800 text-white text-xs font-bold px-2.5 py-1.5 rounded-lg shadow-lg whitespace-nowrap border border-white/10">
          {label}
        </span>
      )}
    </div>
  );
}