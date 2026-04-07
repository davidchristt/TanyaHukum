"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ✅ REQUEST RESET (kirim email)
  const handleRequestReset = async () => {
    setError("");
    setMessage("");

    if (!email) {
      setError("Email wajib diisi");
      return;
    }

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal kirim reset");
      }

      setMessage("Link reset password telah dikirim");

      // dev mode redirect langsung
      if (data.resetUrl) {
        window.location.href = data.resetUrl;
      }

    } catch (err) {
      setError(err.message);
    }
  };

  // ✅ RESET PASSWORD
  const handleResetPassword = async () => {
    setError("");
    setMessage("");

    if (!password) {
      setError("Password baru wajib diisi");
      return;
    }

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          newPassword: password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal reset password");
      }

      setMessage("Password berhasil diubah");

      // ✅ redirect ke login
      setTimeout(() => {
        router.push("/login");
      }, 1500);

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-100">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md text-gray-800">
        
        <h2 className="text-2xl font-semibold text-center mb-6">
          {token ? "Reset Password" : "Lupa Password"}
        </h2>

        {/* ===================== */}
        {/* MODE 1: INPUT EMAIL */}
        {/* ===================== */}
        {!token && (
          <>
            <input
              type="email"
              placeholder="Masukkan Email Anda"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4
              focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <button
              onClick={handleRequestReset}
              className="w-full bg-blue-600 text-white py-2 rounded-lg"
            >
              Kirim Link Reset
            </button>
          </>
        )}

        {/* ===================== */}
        {/* MODE 2: INPUT PASSWORD */}
        {/* ===================== */}
        {token && (
          <>
            <input
              type="password"
              placeholder="Password baru"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4
              focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <button
              onClick={handleResetPassword}
              className="w-full bg-blue-600 text-white py-2 rounded-lg"
            >
              Reset Password
            </button>
          </>
        )}

        {/* ===================== */}
        {/* FEEDBACK */}
        {/* ===================== */}
        {error && (
          <p className="text-red-500 text-sm mt-3">{error}</p>
        )}

        {message && (
          <p className="text-green-500 text-sm mt-3">{message}</p>
        )}

        {/* ===================== */}
        {/* BACK TO LOGIN */}
        {/* ===================== */}
        <button
          onClick={() => router.push("/login")}
          className="mt-5 text-sm text-blue-600 w-full"
        >
          Kembali ke Login
        </button>

      </div>
    </div>
  );
}