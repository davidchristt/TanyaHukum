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
      className={`relative z-10 h-full bg-white/60 backdrop-blur-md rounded-2xl p-4 shadow-lg 
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
              className="p-2 rounded-lg border border-blue-300 hover:bg-blue-50 transition"
            >
              <img src="/icons/sidebar.svg" className="w-5 h-5" alt="toggle" />
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
                rounded-lg bg-white/90 border border-blue-300"
              >
                <img src="/icons/sidebar.svg" className="w-5 h-5" alt="toggle" />
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
        } cursor-pointer hover:bg-blue-50 rounded-xl p-2 transition`}
      >
        <img 
          src={user?.avatarUrl || "/icons/profile.svg"} 
          className={`w-9 h-9 shrink-0 ${user?.avatarUrl ? "rounded-full object-cover border border-gray-200" : "object-contain opacity-60"}`} 
          alt="Profile"
        />

        {isOpen && (
          <div className="overflow-hidden">
            <p className="text-sm font-black text-gray-900 truncate">
              {user?.nama || user?.name || "Admin"}
            </p>
            <p className="text-xs font-bold text-blue-500">Superuser</p>
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
        } gap-3 py-3 border rounded-xl transition
        ${
          isActive
            ? "border-blue-600 bg-blue-50 shadow-sm"
            : "border-transparent hover:bg-blue-50 hover:border-blue-200"
        }`}
      >
        <img
          src={icon}
          className="w-5 h-5 object-contain bg-transparent"
          alt={label}
        />
        {isOpen && <span className={`text-sm font-bold ${isActive ? "text-blue-700" : "text-gray-600"}`}>{label}</span>}
      </button>

      {!isOpen && (
        <span className="absolute left-14 top-1/2 -translate-y-1/2 
        opacity-0 group-hover/item:opacity-100 pointer-events-none transition z-50
        bg-gray-900 text-white text-xs font-bold px-2.5 py-1.5 rounded-lg shadow-lg whitespace-nowrap">
          {label}
        </span>
      )}
    </div>
  );
}