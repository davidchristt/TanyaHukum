"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { resetPassword } from "../../../src/lib/auth";

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const emailParam = searchParams.get("email"); // Fallback if passed in URL

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Token tidak ditemukan. Link reset tidak valid.");
    }
  }, [token]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!token) {
      setError("Token tidak valid.");
      return;
    }

    if (password.length < 8) {
      setError("Password minimal 8 karakter.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Password dan konfirmasi password tidak cocok.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await resetPassword({ token, newPassword: password });
      setSuccess(true);
      
      // Auto redirect after 3 seconds
      setTimeout(() => {
        router.push("/chatbot?auth=login");
      }, 3000);
    } catch (err) {
      setError(err.message || "Gagal mengubah password. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-md bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] border border-white/20 dark:border-slate-800/50 text-center animate-in fade-in zoom-in-95 duration-500 transition-all">
        <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-emerald-100 dark:border-emerald-800/30 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-emerald-500 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4 tracking-tight transition-colors">Password Berhasil Diubah!</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 max-w-[280px] mx-auto font-medium transition-colors">
          Password Anda telah diperbarui. Anda akan dialihkan ke halaman login dalam hitungan detik.
        </p>
        <button
          onClick={() => router.push("/chatbot?auth=login")}
          className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm shadow-lg shadow-blue-200 dark:shadow-none transition-all active:scale-[0.98]"
        >
          Masuk Sekarang
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] border border-white/20 dark:border-slate-800/50 animate-in fade-in slide-in-from-bottom-10 duration-500 transition-all">
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-[9px] font-black tracking-widest uppercase mb-4 border border-blue-100 dark:border-blue-900/30 transition-colors">
          Security Update
        </div>
        <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2 tracking-tight transition-colors">Reset Password</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium transition-colors">
          Silakan masukkan password baru Anda untuk mengamankan akun.
        </p>
      </div>

      <div className="space-y-6">
        {/* Email Field (Disabled) */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1 uppercase tracking-wider transition-colors">Email Terkait</label>
          <input
            type="email"
            value={emailParam || "User Account"}
            disabled
            className="w-full px-4 py-3.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-70 transition-colors text-sm font-medium"
          />
          <p className="text-[10px] text-gray-400 dark:text-gray-600 ml-1 font-bold italic transition-colors">*Email terverifikasi melalui token</p>
        </div>

        {/* New Password */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1 uppercase tracking-wider transition-colors">Password Baru</label>
          <div className="relative group">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3.5 bg-gray-50/50 dark:bg-slate-800/40 border border-gray-200 dark:border-slate-700/80 rounded-2xl 
              focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 text-gray-900 dark:text-white transition-all text-sm font-medium"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"
            >
              <img
                src={showPassword ? "/icons/mataPW.svg" : "/icons/tutupMata.svg"}
                alt="toggle"
                className="w-5 h-5 opacity-50 group-focus-within:opacity-100 dark:invert transition-opacity"
              />
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1 uppercase tracking-wider transition-colors">Konfirmasi Password Baru</label>
          <div className="relative group">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3.5 bg-gray-50/50 dark:bg-slate-800/40 border border-gray-200 dark:border-slate-700/80 rounded-2xl 
              focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 text-gray-900 dark:text-white transition-all text-sm font-medium"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"
            >
              <img
                src={showConfirmPassword ? "/icons/mataPW.svg" : "/icons/tutupMata.svg"}
                alt="toggle"
                className="w-5 h-5 opacity-50 group-focus-within:opacity-100 dark:invert transition-opacity"
              />
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 p-4 rounded-2xl animate-shake transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <p className="text-xs font-bold leading-tight">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={loading || !token}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
          text-white py-4 rounded-2xl font-black text-sm shadow-lg shadow-blue-200 dark:shadow-none transition-all flex items-center justify-center gap-2 active:scale-[0.98] tracking-wider uppercase"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Mengolah...</span>
            </>
          ) : (
            "Ubah Password"
          )}
        </button>

        {/* Back Link */}
        <div className="pt-4 text-center">
          <button
            onClick={() => router.push("/chatbot")}
            className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-blue-600 transition-all"
          >
            Batal dan Kembali ke Beranda
          </button>
        </div>
      </div>
    </div>
  );
}