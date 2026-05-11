import React, { useEffect, useState } from "react";
import ProfileModal from "@/components/features/profile/ProfileModal";
import SubscriptionModal from "@/components/features/subscription/SubscriptionModal";
import AuthModal from "@/components/features/auth/AuthModal";
import AdminProfileModal from "@/components/features/profileAdmin/AdminProfileModal";

/**
 * AppShell provides the core layout structure for all main pages (Chatbot, Dashboard, Admin, etc.).
 * It ensures perfect visual consistency, corner radius synchronization, and immersive background effects.
 */
export default function AppShell({ 
  children, 
  sidebar, 
  header, 
  sidebarOpen, 
  setSidebarOpen,
  hideHeader = false,
  isAdmin = false,
  customModals = null
}) {
  const [user, setUser] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showSubscription, setShowSubscription] = useState(false);
  const [authMode, setAuthMode] = useState(null);

  useEffect(() => {
    const loadUser = () => {
      const stored = localStorage.getItem("user");
      setUser(stored ? JSON.parse(stored) : null);
    };
    loadUser();
    window.addEventListener("auth-change", loadUser);
    return () => window.removeEventListener("auth-change", loadUser);
  }, []);

  const handleUpdateLocalUser = (newData) => {
    const updatedUser = { ...user, ...newData };
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
    window.dispatchEvent(new Event("auth-change"));
  };

  return (
    <div className="h-screen flex relative overflow-hidden bg-[#e6eef8]">
      
      {/* Ambient Glow Effects - Unified Background Atmosphere */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-15%] right-[-10%] w-[60%] h-[60%] bg-blue-400/10 blur-[140px] rounded-full" />
        <div className="absolute bottom-[-15%] left-[-10%] w-[50%] h-[50%] bg-blue-600/5 blur-[120px] rounded-full" />
        <div className="absolute top-[40%] left-[10%] w-[30%] h-[30%] bg-blue-500/5 blur-[100px] rounded-full" />
      </div>

      {/* Sidebar Wrapper - Exact spacing match across all pages */}
      <div
        className={`transition-all duration-300 relative z-20 ${
          sidebarOpen ? "w-[280px]" : "w-[80px]"
        }`}
      >
        {sidebar && React.cloneElement(sidebar, { 
          onOpenProfile: () => setShowProfile(true),
          user: user,
          isOpen: sidebarOpen,
          setIsOpen: setSidebarOpen
        })}
      </div>

      {/* Main Content Area - Immersive Glass Panel */}
      <div className="flex-1 relative z-10 overflow-hidden">
        <div className="h-full flex flex-col bg-white/70 backdrop-blur-md rounded-2xl shadow-lg min-h-0 overflow-hidden relative border border-white/20">
          
          {/* Internal Header (if provided and not hidden) */}
          {!hideHeader && header && (
            <div className="flex-none border-b border-gray-200/60">
              {React.cloneElement(header, { 
                onOpenSubscription: () => setShowSubscription(true),
                onOpenAuth: (mode) => setAuthMode(mode || "login"),
                onOpenProfile: () => setShowProfile(true)
              })}
            </div>
          )}

          {/* Page Content Scroll Area */}
          <div className="flex-1 overflow-auto custom-scrollbar relative z-10">
            {children}
          </div>

        </div>
      </div>

      {/* MODAL SYSTEM */}
      {customModals ? (
        customModals
      ) : (
        isAdmin ? (
          <AdminProfileModal
            isOpen={showProfile}
            onClose={() => setShowProfile(false)}
            userData={user || {}}
            updateLocalUser={handleUpdateLocalUser}
          />
        ) : (
          <>
            <ProfileModal 
              isOpen={showProfile} 
              onClose={() => setShowProfile(false)} 
              user={user} 
            />

            <SubscriptionModal 
              isOpen={showSubscription} 
              onClose={() => setShowSubscription(false)} 
              user={user} 
            />

            <AuthModal
              isOpen={!!authMode}
              initialMode={authMode || "login"}
              onClose={() => setAuthMode(null)}
              onLoginSuccess={(userData) => {
                setUser(userData);
                setAuthMode(null);
              }}
            />
          </>
        )
      )}
    </div>
  );
}
