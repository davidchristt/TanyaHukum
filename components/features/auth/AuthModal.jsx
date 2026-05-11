import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import ForgotPasswordForm from "./ForgotPasswordForm";

export default function AuthModal({ isOpen, onClose, initialMode = "login", onLoginSuccess }) {
  const [mode, setMode] = useState(initialMode);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
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

  if (!isOpen || !mounted) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/20 backdrop-blur-md transition-all duration-500 animate-in fade-in"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-md mx-4 transform transition-all duration-500 animate-fade-up">
        {/* Modal Container */}
        <div className="bg-white rounded-3xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] overflow-hidden border border-white/20">
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
    </div>,
    document.body
  );
}
