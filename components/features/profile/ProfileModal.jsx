"use client";

import ProfileCard from "./ProfileCard";
import ProfileForm from "./ProfileForm";

export default function ProfileModal({ isOpen, onClose, user }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center 
      bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 z-50 
          bg-white hover:bg-gray-100 
          p-2 rounded-full shadow"
        >
          ✕
        </button>

        {/* 🔥 kirim onLogout */}
        <ProfileCard user={user} onLogout={onClose} />

        <ProfileForm />
      </div>
    </div>
  );
}