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
      <div className="text-center py-10 animate-in fade-in zoom-in-95 duration-500">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Password Berhasil Diubah!</h2>
        <p className="text-gray-600 mb-8 max-w-sm mx-auto">
          Password Anda telah diperbarui. Anda akan dialihkan ke halaman login dalam hitungan detik.
        </p>
        <button
          onClick={() => router.push("/chatbot?auth=login")}
          className="text-[#2f6fed] font-bold hover:underline"
        >
          Masuk Sekarang
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-2xl border border-gray-100 animate-in fade-in slide-in-from-bottom-10 duration-500">
      <div className="mb-10">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h2>
        <p className="text-gray-500">
          Silakan masukkan password baru Anda di bawah ini.
        </p>
      </div>

      <div className="space-y-6">
        {/* Email Field (Disabled) */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700 ml-1">Email Terkait</label>
          <input
            type="email"
            value={emailParam || "User Account"}
            disabled
            className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-2xl text-gray-500 cursor-not-allowed opacity-70"
          />
          <p className="text-[10px] text-gray-400 ml-1 italic">*Email ini terverifikasi melalui token reset</p>
        </div>

        {/* New Password */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700 ml-1">Password Baru</label>
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
              onClick={() => setShowPassword(!showPassword)}
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

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700 ml-1">Konfirmasi Password Baru</label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl 
              focus:outline-none focus:ring-2 focus:ring-[#2f6fed]/20 focus:border-[#2f6fed] transition-all"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <img
                src={showConfirmPassword ? "/icons/mataPW.svg" : "/icons/tutupMata.svg"}
                alt="toggle"
                className="w-5 h-5 opacity-70"
              />
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 text-red-500 bg-red-50 p-4 rounded-2xl animate-shake">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <p className="text-xs font-medium">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={loading || !token}
          className="w-full bg-[#2f6fed] hover:bg-[#255cd6] disabled:opacity-70 disabled:cursor-not-allowed
          text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Mengubah Password...</span>
            </>
          ) : (
            "Ubah Password"
          )}
        </button>

        {/* Back Link */}
        <div className="pt-4 text-center">
          <button
            onClick={() => router.push("/chatbot")}
            className="text-sm font-bold text-gray-500 hover:text-[#2f6fed] transition-colors"
          >
            Batal dan Kembali ke Beranda
          </button>
        </div>
      </div>
    </div>
  );
}