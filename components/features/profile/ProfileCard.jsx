"use client";

import { uploadAvatar } from "@/src/lib/profile";

export default function ProfileCard({ user, onLogout }) {

  if (!user) return null;

  // ==============================
  // UPLOAD AVATAR
  // ==============================
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const res = await uploadAvatar(file);

      // update localStorage biar global ikut berubah
      const updatedUser = {
        ...user,
        avatarUrl: res.user.avatarUrl,
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));

      // trigger global update
      window.dispatchEvent(new Event("auth-change"));

      window.dispatchEvent(new Event("show-toast"));

    } catch (err) {
      console.error(err);
    }
  };

  // ==============================
  // LOGOUT
  // ==============================
  const handleLogout = async () => {
    try {
      await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });

      localStorage.removeItem("user");

      window.dispatchEvent(new Event("auth-change"));

      if (onLogout) onLogout();

      window.dispatchEvent(new Event("show-toast"));

    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-md flex items-center gap-6">

      {/* AVATAR */}
      <div className="relative">
        <div className="w-24 h-24 rounded-full border-[5px] border-blue-500 overflow-hidden flex items-center justify-center bg-gray-100">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 bg-blue-500 rounded-full" />
          )}
        </div>

        <input
          type="file"
          accept="image/*"
          id="upload-avatar"
          className="hidden"
          onChange={handleUpload}
        />
      </div>

      {/* INFO */}
      <div className="flex flex-col">

        {/* NAME + BADGE */}
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-semibold text-gray-900">
            {user.name}
          </h2>
        </div>

        {/* EMAIL */}
        <p className="text-sm text-gray-500 mt-1">
          {user.email}
        </p>

        {/* TIER */}
        <p
          className={`text-xs mt-1 font-medium ${
            user.tier === "PRO"
              ? "text-yellow-600"
              : "text-gray-400"
          }`}
        >
          Paket: {user.tier === "PRO" ? "PRO Member" : "FREE"}
        </p>

        {/* BUTTONS */}
        <div className="flex gap-3 mt-3">

          <label
            htmlFor="upload-avatar"
            className="px-4 py-2 rounded-lg 
            bg-[#7FAFD4] hover:bg-[#6c9cc2] 
            text-white text-sm font-medium shadow-sm transition cursor-pointer"
          >
            Unggah Foto
          </label>

          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg 
            bg-red-500 hover:bg-red-600 
            text-white text-sm font-medium shadow-sm transition"
          >
            Keluar
          </button>

        </div>
      </div>
    </div>
  );
}