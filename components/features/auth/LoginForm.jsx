"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  // =========================
  // ✅ GOOGLE INIT
  // =========================
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        callback: handleGoogleCallback,
      });

      window.google.accounts.id.renderButton(
        document.getElementById("google-btn"),
        {
          theme: "outline",
          size: "large",
          width: "100%",
        }
      );
    };
  }, []);

  // =========================
  // ✅ LOGIN BIASA
  // =========================
  const handleLogin = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login gagal");
      }

      // ✅ SIMPAN SESSION
      localStorage.setItem("user", JSON.stringify(data.user));

      setSuccess("Login berhasil");

      setTimeout(() => {
        router.push("/chatbot");
      }, 1500);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // ✅ GOOGLE CALLBACK
  // =========================
  const handleGoogleCallback = async (response) => {
    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          credentialToken: response.credential,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login Google gagal");
      }

      // ✅ SIMPAN SESSION
      localStorage.setItem("user", JSON.stringify(data.user));

      setSuccess("Login Google berhasil");

      setTimeout(() => {
        router.push("/chatbot");
      }, 1500);

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      {/* Toast */}
      {success && (
        <div className="fixed top-5 right-5 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          {success}
        </div>
      )}

      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
          Masuk ke Akun Anda
        </h2>

        <div className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Email</label>
            <input
              type="email"
              placeholder="Masukkan Email Anda"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg 
              text-gray-800 placeholder-gray-400
              focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Password */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm text-gray-600">Kata Sandi</label>
              <span
                onClick={() => router.push("/reset-password")}
                className="text-sm text-blue-500 cursor-pointer"
              >
                Lupa Kata Sandi ?
              </span>
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Masukkan Kata Sandi Anda"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg 
                text-gray-800 placeholder-gray-400
                focus:outline-none focus:ring-2 focus:ring-blue-400"
              />

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

          {/* Error */}
          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          {/* Login */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 transition 
            text-white py-2.5 rounded-lg font-medium shadow-md"
          >
            {loading ? "Loading..." : "Masuk Sekarang"}
          </button>

          {/* Google */}
          <div id="google-btn" className="w-full flex justify-center"></div>

          {/* Register */}
          <p className="text-center text-sm text-gray-500">
            Belum Punya Akun?{" "}
            <Link href="/register" className="text-blue-600">
              Daftar Sekarang
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}