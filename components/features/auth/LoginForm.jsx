"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loginUser, loginWithGoogle } from "../../../src/lib/auth";

export default function LoginForm({ 
  onClose, 
  onSwitchToRegister, 
  onSwitchToForgotPassword,
  onLoginSuccess, 
  isModal = false 
}){
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

      const userToSave = {
        id: data.user.id,
        email: data.user.email,
        role: data.user.role,
        tier: data.user.tier,
        promptLimit: data.user.promptLimit,
        nama: data.user.name || data.user.nama || "", 
        avatarUrl: data.user.avatarUrl || "",         
      };

      localStorage.setItem("user", JSON.stringify(userToSave));

      if (data.user.role === "ADMIN") {
        router.push("/admin"); 
      } else {
        if (onLoginSuccess) {
          onLoginSuccess(userToSave);
        }
        if (onClose) onClose();
        
        // Selalu arahkan user ke chatbot setelah login berhasil
        router.push("/chatbot");
      }
      
      window.dispatchEvent(new Event("auth-change"));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Email dan kata sandi wajib diisi");
      return;
    }
    
    setLoading(true);
    setError("");

    try {
      const data = await loginUser({ email, password });

      const userToSave = {
        id: data.user.id,
        email: data.user.email,
        role: data.user.role,
        tier: data.user.tier,
        promptLimit: data.user.promptLimit,
        nama: data.user.name || data.user.nama || "", 
        avatarUrl: data.user.avatarUrl || "",         
      };

      localStorage.setItem("user", JSON.stringify(userToSave));

      if (data.user.role === "ADMIN") {
        router.push("/admin"); 
      } else {
        if (onLoginSuccess) {
          onLoginSuccess(userToSave); 
        }
        if (onClose) onClose();
      }

      window.dispatchEvent(new Event("auth-change"));

    } catch (err) {
      setError(err.message || "Gagal masuk. Silakan cek kembali email dan kata sandi Anda.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordClick = () => {
    if (onSwitchToForgotPassword) {
      onSwitchToForgotPassword();
    } else {
      router.push("/reset-password");
    }
  };

  const formContent = (
    <>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 text-center md:text-left transition-colors">
          Selamat Datang
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-center md:text-left transition-colors">
          Masuk ke akun Anda untuk melanjutkan
        </p>
      </div>

      <div className="space-y-5">
        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1 transition-colors">Email</label>
          <input
            type="email"
            placeholder="nama@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-2xl 
            focus:outline-none focus:ring-2 focus:ring-[#2f6fed]/20 focus:border-[#2f6fed] text-gray-900 dark:text-white transition-all"
          />
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center px-1">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 transition-colors">Kata Sandi</label>
            <button
              type="button"
              onClick={handleForgotPasswordClick}
              className="text-xs font-medium text-[#2f6fed] hover:underline transition-all"
            >
              Lupa Kata Sandi?
            </button>
          </div>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-2xl 
              focus:outline-none focus:ring-2 focus:ring-[#2f6fed]/20 focus:border-[#2f6fed] text-gray-900 dark:text-white transition-all"
            />

            <button
              type="button"
              onClick={togglePassword}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <img
                src={showPassword ? "/icons/mataPW.svg" : "/icons/tutupMata.svg"}
                alt="toggle"
                className="w-5 h-5 opacity-70 dark:invert"
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
          onClick={handleLogin}
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
              <span>Memproses...</span>
            </>
          ) : (
            "Masuk"
          )}
        </button>

        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-100 dark:border-slate-800"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-slate-900 px-2 text-gray-400 dark:text-gray-500 transition-colors">Atau masuk dengan</span>
          </div>
        </div>

        {/* Google */}
        <div className="w-full flex justify-center py-1">
          <div id="google-btn"></div>
        </div>

        {/* Switch to Register */}
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 pt-2 transition-colors">
          Belum punya akun?{" "}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="text-[#2f6fed] font-bold hover:underline transition-all"
          >
            Daftar Sekarang
          </button>
        </p>
      </div>
    </>
  );

  if (!isModal) {
    return (
      <div className="min-h-screen bg-[#e6eef8] dark:bg-[#0b1120] flex items-center justify-center p-4 transition-colors duration-500">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 p-10 rounded-3xl shadow-xl border border-transparent dark:border-slate-800 transition-colors">
          {formContent}
        </div>
      </div>
    );
  }

  return formContent;
}