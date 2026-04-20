"use client";

import { useState, useEffect } from "react";

import Sidebar from "@/components/layout/Sidebar";
import ChatArea from "@/components/features/chat/ChatArea";

// AUTH
import LoginForm from "@/components/features/auth/LoginForm";
import RegisterForm from "@/components/features/auth/RegisterForm";

// SUBSCRIPTION
import SubscriptionList from "@/components/features/subscription/SubscriptionList";

import ProfileModal from "@/components/features/profile/ProfileModal";

import { getProfile } from "@/src/lib/profile";

export default function ChatbotPage() {
  const [isOpen, setIsOpen] = useState(true);

  // AUTH
  const [authMode, setAuthMode] = useState(null);

  // USER (source of truth)
  const [user, setUser] = useState(null);

  // SUBSCRIPTION
  const [showSubscription, setShowSubscription] = useState(false);

  const [showProfile, setShowProfile] = useState(false);

  const [showToast, setShowToast] = useState(false);

  const handleLoginSuccess = (userData) => {
  setUser(userData); // 🔥 langsung set state
  };

  // ==============================
  // LOAD USER (API BASED)
  // ==============================
  useEffect(() => {
    const loadUser = () => {
      const stored = localStorage.getItem("user");

      if (!stored) {
        setUser(null);
        return;
      }

      try {
        const parsed = JSON.parse(stored);
        setUser(parsed);
      } catch {
        setUser(null);
      }
    };

    loadUser();

    window.addEventListener("auth-change", loadUser);

    return () => {
      window.removeEventListener("auth-change", loadUser);
    };
  }, []);

  useEffect(() => {
  const handleToast = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  window.addEventListener("show-toast", handleToast);

  return () => {
    window.removeEventListener("show-toast", handleToast);
  };
}, []);

  return (
    <div className="h-screen bg-blue-100 flex">

      {/* SIDEBAR */}
      <div
        className={`transition-all duration-300 ${
          isOpen ? "w-[280px]" : "w-[80px]"
        }`}
      >
        <Sidebar
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          onOpenProfile={() => setShowProfile(true)}
          user={user}
        />
      </div>

      {/* CHAT AREA */}
      <div className="flex-1">
        <ChatArea
          user={user}
          onOpenAuth={(mode) => setAuthMode(mode || "login")}
          onOpenSubscription={() => setShowSubscription(true)}
        />
      </div>

      {/* ================= AUTH POPUP ================= */}
      {authMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">

          <div className="relative w-full max-w-md">

            <button
              onClick={() => setAuthMode(null)}
              className="absolute top-4 right-4 text-[#2f6fed] hover:text-white 
              hover:bg-[#2f6fed] transition p-2 rounded-full"
            >
              ✕
            </button>

            {authMode === "login" && (
              <LoginForm
                onClose={() => setAuthMode(null)}
                onLoginSuccess={handleLoginSuccess}
              />
            )}

            {authMode === "register" && (
              <RegisterForm
                onClose={() => {
                  setAuthMode(null);
                  window.dispatchEvent(new Event("auth-change"));
                }}
                onSwitchToLogin={() => setAuthMode("login")}
              />
            )}

          </div>
        </div>
      )}

      {/* ================= SUBSCRIPTION POPUP ================= */}
      {showSubscription && (
        <SubscriptionList
          user={user}
          onComplete={() => setShowSubscription(false)}
        />
      )}

      {/* ================= PROFILE POPUP ================= */}
      {showProfile && (
        <ProfileModal
          isOpen={showProfile}
          onClose={() => setShowProfile(false)}
          user={user} // 🔥 TAMBAH INI
        />
      )}

      {/* ================= TOAST ================= */}
      {showToast && (
        <div className="fixed top-6 right-6 z-50">
          <div className="bg-white border border-green-200 shadow-xl rounded-xl px-5 py-4 flex items-center gap-3">
            
            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-sm">
              ✓
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-900">
                Berhasil
              </p>
              <p className="text-xs text-gray-500">
                Aksi berhasil dilakukan
              </p>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}