"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerUser, loginWithGoogle } from "../../../src/lib/auth";

export default function RegisterForm({ onClose, onSwitchToLogin, isModal = false }) {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  // GOOGLE INIT
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (!window.google) return;

      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        callback: handleGoogleCallback,
      });

      const btnContainer = document.getElementById("google-btn");
      if (btnContainer) {
        window.google.accounts.id.renderButton(
          btnContainer,
          {
            theme: "outline",
            size: "large",
            width: "320",
            shape: "pill",
            text: "signup_with",
          }
        );
      }
    };
  }, []);

  const handleGoogleCallback = async (response) => {
    try {
      const data = await loginWithGoogle({
        credentialToken: response.credential,
      });

      localStorage.setItem("user", JSON.stringify(data.user));
      router.push("/chatbot");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = async () => {
    if (!email || !password) {
      setError("Email dan kata sandi wajib diisi");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await registerUser({ email, password });
      onSwitchToLogin();
    } catch (err) {
      setError(err.message || "Gagal mendaftar. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const formContent = (
    <>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center md:text-left">
          Buat Akun
        </h2>
        <p className="text-gray-500 text-center md:text-left">
          Daftar sekarang untuk mulai berkonsultasi
        </p>
      </div>

      <div className="space-y-5">
        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700 ml-1">Email</label>
          <input
            type="email"
            placeholder="nama@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl 
            focus:outline-none focus:ring-2 focus:ring-[#2f6fed]/20 focus:border-[#2f6fed] transition-all"
          />
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700 ml-1">
            Kata Sandi
          </label>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl 
              focus:outline-none focus:ring-2 focus:ring-[#2f6fed]/20 focus:border-[#2f6fed] transition-all"
            />

            <button
              type="button"
              onClick={togglePassword}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <img
                src={showPassword ? "/icons/mataPW.svg" : "/icons/tutupMata.svg"}
                alt="toggle"
                className="w-5 h-5 opacity-70"
              />
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 text-red-500 bg-red-50 p-3 rounded-xl animate-shake">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            <p className="text-xs font-medium">{error}</p>
          </div>
        )}

        {/* Button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-[#2f6fed] hover:bg-[#255cd6] disabled:opacity-70 disabled:cursor-not-allowed
          text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Mendaftarkan...</span>
            </>
          ) : (
            "Daftar Sekarang"
          )}
        </button>

        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-100"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-400">Atau daftar dengan</span>
          </div>
        </div>

        {/* GOOGLE */}
        <div className="w-full flex justify-center py-1">
          <div id="google-btn"></div>
        </div>

        {/* Login */}
        <p className="text-center text-sm text-gray-500 pt-2">
          Sudah punya akun?{" "}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-[#2f6fed] font-bold hover:underline transition-all"
          >
            Masuk
          </button>
        </p>
      </div>
    </>
  );

  if (!isModal) {
    return (
      <div className="min-h-screen bg-[#e6eef8] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-xl">
          {formContent}
        </div>
      </div>
    );
  }

  return formContent;
}