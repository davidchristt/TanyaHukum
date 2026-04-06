"use client";

import { useRouter } from "next/navigation";

export default function Sidebar({ isOpen, setIsOpen }) {
  const router = useRouter(); // ✅ WAJIB

  return (
    <div
      className={`relative z-50 h-full bg-white/60 backdrop-blur-md rounded-2xl p-4 shadow-lg 
      flex flex-col justify-between transition-all duration-300 
      ${isOpen ? "w-64" : "w-20 items-center"}`}
    >
      {/* TOP */}
      <div className="w-full">
        
        {/* ===== HEADER ===== */}
        {isOpen ? (
          <div className="flex items-center justify-between mb-6">
            <img src="/icons/logo.svg" className="w-14 h-14" />

            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-lg border border-blue-300 hover:bg-blue-50 transition"
            >
              <img src="/icons/sidebar.svg" className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="flex justify-center mb-6">
            <div className="relative group/logo">
              
              <img src="/icons/logo.svg" className="w-14 h-14" />

              <button
                onClick={() => setIsOpen(true)}
                className="absolute inset-0 flex items-center justify-center 
                opacity-0 group-hover/logo:opacity-100 transition z-50
                rounded-lg bg-white/90 border border-blue-300"
              >
                <img src="/icons/sidebar.svg" className="w-5 h-5" />
              </button>

              <span className="absolute left-12 top-1/2 -translate-y-1/2 
              opacity-0 group-hover/logo:opacity-100 transition z-50
              bg-gray-900 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap">
                Open sidebar
              </span>
            </div>
          </div>
        )}

        {/* ===== MENU ===== */}
        <div className="space-y-3">
          <MenuItem icon="/icons/newChat.svg" label="Obrolan Baru" isOpen={isOpen} />
          <MenuItem icon="/icons/dashboardStatistik.svg" label="Dashboard Statistik" isOpen={isOpen} />
          <MenuItem icon="/icons/pusatDataSidebar.svg" label="Pusat Data Hukum" isOpen={isOpen} />
        </div>

        {/* ===== CHAT LIST ===== */}
        {isOpen && (
          <>
            <p className="text-xs text-gray-500 mt-6 mb-2 px-1">
              Obrolan Anda
            </p>

            <div className="space-y-2">
              <ChatItem text="Apa Itu Hukum Perdata?" />
              <ChatItem text="Apa itu Hukum Pidana?" />
            </div>
          </>
        )}
      </div>

      {/* ===== PROFILE ===== */}
      <div
        onClick={() => router.push("/profile")} // ✅ INI YANG BUKA MODAL
        className={`flex items-center ${
          isOpen ? "gap-3 px-2" : "justify-center"
        } cursor-pointer hover:bg-blue-50 rounded-xl p-2 transition`}
      >
        <img src="/icons/profile.svg" className="w-9 h-9" />

        {isOpen && (
          <div>
            <p className="text-sm font-medium text-gray-900">David</p>
            <p className="text-xs text-gray-500">Gratis</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ===== MENU ITEM ===== */

function MenuItem({ icon, label, isOpen }) {
  return (
    <div className="relative group/item">
      <button
        className={`w-full flex items-center ${
          isOpen ? "justify-start px-3" : "justify-center"
        } gap-3 py-3 border border-blue-200 rounded-xl hover:bg-blue-50 transition`}
      >
        <img
          src={icon}
          className="w-5 h-5 object-contain bg-transparent"
        />
        {isOpen && <span className="text-gray-800 text-sm">{label}</span>}
      </button>

      {!isOpen && (
        <span className="absolute left-14 top-1/2 -translate-y-1/2 
        opacity-0 group-hover/item:opacity-100 transition z-50
        bg-gray-900 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap">
          {label}
        </span>
      )}
    </div>
  );
}

/* ===== CHAT ITEM ===== */

function ChatItem({ text }) {
  return (
    <div className="p-2 border rounded-lg text-sm text-gray-700 hover:bg-gray-50 cursor-pointer transition">
      {text}
    </div>
  );
}