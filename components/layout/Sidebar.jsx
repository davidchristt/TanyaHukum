"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import {
  getConversations,
  createNewConversation,
  setActiveConversation,
} from "@/src/lib/chat";

/* ===== MENU ===== */
const MENU = [
  {
    label: "Obrolan Baru",
    icon: "/icons/newChat.svg",
    action: "new_chat",
  },
  {
    label: "Dashboard Statistik",
    icon: "/icons/dashboardStatistik.svg",
    path: "/dashboard",
  },
  {
    label: "Pusat Data Hukum",
    icon: "/icons/pusatDataSidebar.svg",
    path: "/pusat-data",
  },
];

export default function Sidebar({ isOpen, setIsOpen, onOpenProfile }) {
  const router = useRouter();
  const pathname = usePathname();

  const [chatHistory, setChatHistory] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = () => {
      const stored = localStorage.getItem("user");
      setUser(stored ? JSON.parse(stored) : null);
    };

    loadUser();

    // 🔥 penting
    window.addEventListener("auth-change", loadUser);

    return () => {
      window.removeEventListener("auth-change", loadUser);
    };
  }, []);

  // ==============================
  // LOAD HISTORY
  // ==============================
  useEffect(() => {
    if (pathname !== "/chatbot") return;

    const load = () => {
      const convs = getConversations();
      const filtered = convs.filter((c) => c.messages.length > 0);
      setChatHistory([...filtered].reverse());
    };

    load();

    window.addEventListener("storage", load);
    return () => window.removeEventListener("storage", load);
  }, [pathname]);

  // ==============================
  // MENU CLICK
  // ==============================
  const handleMenuClick = (item) => {
    if (item.action === "new_chat") {
      const newConv = createNewConversation();
      setActiveConversation(newConv.id);

      window.dispatchEvent(new Event("load-conversation"));
      router.push("/chatbot");
      return;
    }

    router.push(item.path);
  };

  // ==============================
  // RENAME
  // ==============================
  const handleRename = (id) => {
    const name = prompt("Rename chat:");
    if (!name) return;

    const convs = getConversations();

    const updated = convs.map((c) =>
      c.id === id ? { ...c, title: name } : c
    );

    localStorage.setItem("conversations", JSON.stringify(updated));
    window.dispatchEvent(new Event("storage"));
  };

  // ==============================
  // DELETE
  // ==============================
  const handleDelete = (id) => {
    const confirmDelete = confirm("Hapus chat?");
    if (!confirmDelete) return;

    const convs = getConversations().filter((c) => c.id !== id);

    localStorage.setItem("conversations", JSON.stringify(convs));

    if (convs.length > 0) {
      setActiveConversation(convs[0].id);
    } else {
      const newConv = createNewConversation();
      setActiveConversation(newConv.id);
    }

    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new Event("load-conversation"));
  };

  return (
    <div
      className={`relative z-10 h-full bg-white/60 backdrop-blur-md rounded-2xl p-4 shadow-lg 
      flex flex-col justify-between transition-all duration-300 
      ${isOpen ? "w-64" : "w-20 items-center"}`}
    >
      {/* TOP */}
      <div className="w-full flex flex-col h-full">

        {/* HEADER (TIDAK DIUBAH) */}
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
            </div>
          </div>
        )}

        {/* MENU */}
        <div className="space-y-3">
          {MENU.map((item, i) => (
            <MenuItem
              key={i}
              icon={item.icon}
              label={item.label}
              isOpen={isOpen}
              onClick={() => handleMenuClick(item)}
            />
          ))}
        </div>

        {/* HISTORY */}
        {isOpen && pathname === "/chatbot" && (
          <>
            <p className="text-xs text-gray-500 mt-6 mb-2 px-1">
              Obrolan Anda
            </p>

            <div className="space-y-2 flex-1 overflow-y-auto pr-1">

              {chatHistory.length === 0 ? (
                <p className="text-xs text-gray-400 px-2">
                  Belum ada obrolan
                </p>
              ) : (
                chatHistory.map((chat) => (
                  <ChatItem
                    key={chat.id}
                    text={chat.title}
                    onClick={() => {
                      setActiveConversation(chat.id);
                      window.dispatchEvent(new Event("load-conversation"));
                    }}
                    onRename={() => handleRename(chat.id)}
                    onDelete={() => handleDelete(chat.id)}
                  />
                ))
              )}

            </div>
          </>
        )}
      </div>

      {/* ==============================
          PROFILE (FIXED)
      ============================== */}

      {user && ( // ✅ hanya muncul kalau login
        <div
          onClick={onOpenProfile} // ✅ buka modal, bukan route
          className={`flex items-center ${
            isOpen ? "gap-3 px-2" : "justify-center"
          } cursor-pointer hover:bg-blue-50 rounded-xl p-2 transition`}
        >
          <img src="/icons/profile.svg" className="w-9 h-9" />

          {isOpen && (
            <div>
              <p className="text-sm font-medium text-gray-900">
                {user.name || "User"}
              </p>
              <p className="text-xs text-gray-500">
                {user.tier || "Gratis"}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ===== MENU ITEM ===== */
function MenuItem({ icon, label, isOpen, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center ${
        isOpen ? "justify-start px-3" : "justify-center"
      } gap-3 py-3 border rounded-xl transition border-blue-200 hover:bg-blue-50`}
    >
      <img src={icon} className="w-5 h-5" />
      {isOpen && <span className="text-gray-800 text-sm">{label}</span>}
    </button>
  );
}

/* ===== CHAT ITEM ===== */
function ChatItem({ text, onClick, onRename, onDelete }) {
  return (
    <div className="group relative">

      <div
        onClick={onClick}
        className="p-2 border rounded-lg text-sm text-gray-700 hover:bg-gray-50 cursor-pointer truncate"
      >
        {text}
      </div>

      <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 flex gap-2">
        <button onClick={onRename}>✏️</button>
        <button onClick={onDelete}>🗑️</button>
      </div>
    </div>
  );
}