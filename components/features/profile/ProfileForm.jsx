"use client";

import { useState } from "react";

export default function ProfileForm() {
  const [showPassword, setShowPassword] = useState(false);

  const togglePassword = () => setShowPassword(!showPassword);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-md space-y-4">

      <h2 className="text-xl font-semibold text-gray-800">
        Pengaturan Akun
      </h2>

      {/* ===== NAMA ===== */}
      <div>
        <label className="text-sm text-gray-700">Nama</label>
        <input
          defaultValue="David"
          className="w-full mt-1 px-4 py-2 border border-blue-200 rounded-lg 
          text-gray-900 placeholder-gray-400 outline-none 
          focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* ===== EMAIL ===== */}
      <div>
        <label className="text-sm text-gray-700">Email</label>
        <input
          defaultValue="david@gmail.com"
          className="w-full mt-1 px-4 py-2 border border-blue-200 rounded-lg 
          text-gray-900 placeholder-gray-400 outline-none 
          focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* ===== PASSWORD ===== */}
      <div>
        <label className="text-sm text-gray-700">Kata Sandi</label>

        <div className="relative mt-1">
          <input
            type={showPassword ? "text" : "password"}
            defaultValue="********"
            className="w-full px-4 py-2 border border-blue-200 rounded-lg 
            text-gray-900 placeholder-gray-400 outline-none 
            focus:ring-2 focus:ring-blue-400"
          />

          {/* ICON MATA (CUSTOM) */}
          <span
            onClick={togglePassword}
            className="absolute right-3 top-2.5 cursor-pointer"
          >
            <img
              src={
                showPassword
                  ? "/icons/mataPW.svg"
                  : "/icons/tutupMata.svg"
              }
              alt="toggle password"
              className="w-5 h-5"
            />
          </span>
        </div>
      </div>

      {/* BUTTON */}
      <button className="w-full py-3 bg-blue-400 text-white rounded-lg shadow">
        Simpan
      </button>
    </div>
  );
}
