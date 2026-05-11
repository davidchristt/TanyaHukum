"use client";

import { useState, useEffect } from "react";
import { requestPasswordReset } from "../../../src/lib/auth";

export default function ForgotPasswordForm({ onSwitchToLogin }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);

  // Timer logic
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    if (!email) {
      setError("Email wajib diisi");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Format email tidak valid");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const data = await requestPasswordReset({ email });
      setMessage(data.message || "Link reset password telah dikirim ke email Anda.");
      
      // Start cooldown on success
      setCountdown(30);
    } catch (err) {
      setError(err.message || "Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const getButtonText = () => {
    if (loading) return "Mengirim...";
    if (countdown > 0) return `Kirim Ulang dalam ${countdown}s`;
    return "Kirim Link Reset";
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center md:text-left">
          Lupa Password?
        </h2>
        <p className="text-gray-500 text-center md:text-left">
          Masukkan email Anda untuk menerima link reset password
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
            disabled={countdown > 0}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl 
            focus:outline-none focus:ring-2 focus:ring-[#2f6fed]/20 focus:border-[#2f6fed] transition-all
            disabled:opacity-60 disabled:cursor-not-allowed"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 text-red-500 bg-red-50 p-3 rounded-xl animate-shake">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            <p className="text-xs font-medium">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {message && (
          <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-xl animate-in zoom-in-95">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            <p className="text-xs font-medium">{message}</p>
          </div>
        )}

        {/* Button */}
        <button
          onClick={handleSubmit}
          disabled={loading || countdown > 0}
          className="w-full bg-[#2f6fed] hover:bg-[#255cd6] disabled:opacity-70 disabled:cursor-not-allowed
          text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
        >
          {loading && (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          <span>{getButtonText()}</span>
        </button>

        {/* Back to Login */}
        <div className="pt-2">
          <button
            onClick={onSwitchToLogin}
            className="w-full flex items-center justify-center gap-2 text-sm font-bold text-gray-500 hover:text-[#2f6fed] transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Kembali ke Masuk
          </button>
        </div>
      </div>
    </div>
  );
}
