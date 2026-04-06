"use client";

import { useState } from "react";
import Link from "next/link";

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
      {/* Title */}
      <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
        Masuk ke Akun Anda
      </h2>

      {/* Form */}
      <div className="space-y-5">
        {/* Email */}
        <div>
          <label className="block text-sm text-gray-600 mb-1">Email</label>
          <input
            type="email"
            placeholder="Masukkan Email Anda"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg 
            text-gray-800 placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Password */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-sm text-gray-600">Kata Sandi</label>
            <span className="text-sm text-blue-500 cursor-pointer">
              Lupa Kata Sandi ?
            </span>
          </div>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Masukkan Kata Sandi Anda"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg 
              text-gray-800 placeholder-gray-400
              focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            {/* Toggle Icon */}
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

        {/* Button */}
        <button
          className="w-full bg-blue-600 hover:bg-blue-700 transition 
        text-white py-2.5 rounded-lg font-medium shadow-md"
        >
          Masuk Sekarang
        </button>

        {/* Google */}
        <button className="w-full bg-blue-100 text-blue-700 py-2.5 rounded-lg font-medium flex items-center justify-center gap-2">
          <img
            src="/icons/Google - Original.svg"
            alt="google"
            className="w-5 h-5"
          />
          Lanjutkan dengan Google
        </button>

        {/* Register */}
        <p className="text-center text-sm text-gray-500">
          Belum Punya Akun?{" "}
          <Link href="/register" className="text-blue-600">
            Daftar Sekarang
          </Link>
        </p>
      </div>
    </div>
  );
}