"use client";

import { useState, useEffect } from "react";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import ForgotPasswordForm from "./ForgotPasswordForm";

export default function AuthModal({ isOpen, onClose, initialMode = "login", onLoginSuccess }) {
  const [mode, setMode] = useState(initialMode);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      // Focus trap and body scroll lock can be added here
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen, initialMode]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
    }
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md transition-all duration-300 animate-in fade-in"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-md mx-4 transform transition-all duration-300 animate-in zoom-in-95 slide-in-from-bottom-10">
        {/* Modal Container */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/20">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 z-10 text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          <div className="p-8 md:p-10">
            {mode === "login" && (
              <LoginForm
                onClose={onClose}
                onSwitchToRegister={() => setMode("register")}
                onSwitchToForgotPassword={() => setMode("forgot-password")}
                onLoginSuccess={onLoginSuccess}
                isModal={true}
              />
            )}
            {mode === "register" && (
              <RegisterForm
                onClose={onClose}
                onSwitchToLogin={() => setMode("login")}
                isModal={true}
              />
            )}
            {mode === "forgot-password" && (
              <ForgotPasswordForm
                onSwitchToLogin={() => setMode("login")}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
