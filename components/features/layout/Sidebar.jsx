"use client";

import { usePathname } from "next/navigation";

export default function Sidebar({ isOpen, setIsOpen, onOpenProfile, user }) {
  const pathname = usePathname();

  const go = (path) => {
    console.log("GO:", path);
    window.location.href = path;
  };

  return (
    <div
      className={`relative z-50 h-full bg-white/60 backdrop-blur-md rounded-2xl p-4 shadow-lg 
      flex flex-col justify-between transition-all duration-300 
      ${isOpen ? "w-64" : "w-20 items-center"}`}
    >
      {/* TOP */}
      <div className="w-full">

        {/* HEADER */}
        {isOpen ? (
          <div className="flex items-center justify-between mb-6">
            <img src="/icons/logo.svg" className="w-14 h-14" />
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-lg border border-blue-300 hover:bg-blue-100"
            >
              ☰
            </button>
          </div>
        ) : (
          <div className="flex justify-center mb-6">
            <button onClick={() => setIsOpen(true)}>
              <img src="/icons/logo.svg" className="w-14 h-14" />
            </button>
          </div>
        )}

        {/* MENU */}
        <div className="space-y-3">

          <MenuItem
            label="Obrolan Baru"
            active={pathname === "/chatbot"}
            onClick={() => go("/chatbot")}
          />

          <MenuItem
            label="Dashboard Statistik"
            active={pathname === "/dashboard"}
            onClick={() => go("/dashboard")}
          />

          <MenuItem
            label="Pusat Data Hukum"
            active={pathname === "/pusat-data"}
            onClick={() => go("/pusat-data")}
          />

        </div>

        {/* CHAT LIST */}
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

      {/* PROFILE */}
      {user && (
        <div
          onClick={onOpenProfile}
          className={`flex items-center cursor-pointer ${
            isOpen ? "gap-3 px-2" : "justify-center"
          }`}
        >
          <img src="/icons/profile.svg" className="w-9 h-9" />

          {isOpen && (
            <div>
              <p className="text-sm font-medium text-gray-900">
                {user?.name || "User"}
              </p>
              <p className="text-xs text-gray-500">
                {user?.tier === "PRO" ? "PRO" : "Gratis"}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* MENU ITEM */
function MenuItem({ label, onClick, active }) {
  return (
    <button
      onClick={onClick}
      className={`w-full py-3 rounded-xl border transition text-left px-3

      ${
        active
          ? "bg-blue-500 text-white border-blue-500"
          : "border-blue-200 hover:bg-blue-200 text-gray-800"
      }`}
    >
      {label}
    </button>
  );
}

/* CHAT ITEM */
function ChatItem({ text }) {
  return (
    <div className="p-2 border rounded-lg text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
      {text}
    </div>
  );
}