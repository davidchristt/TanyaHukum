"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerUser, loginWithGoogle } from "../../../src/lib/auth";

export default function RegisterForm({ onClose, onSwitchToLogin }) {
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
    setLoading(true);
    setError("");

    try {
      await registerUser({ email, password });
      onSwitchToLogin();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/5 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="relative w-full max-w-md bg-white p-10 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.1)]">

        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#2f6fed] hover:text-white 
          hover:bg-[#2f6fed] transition p-2 rounded-full"
        >
          ✕
        </button>

        <h2 className="text-2xl font-semibold text-center text-gray-900 mb-8">
          Daftar Akun
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
              focus:outline-none focus:ring-2 focus:ring-[#2f6fed]"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Kata Sandi
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Masukkan Kata Sandi Anda"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg 
                focus:outline-none focus:ring-2 focus:ring-[#2f6fed]"
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
                  alt="toggle"
                  className="w-5 h-5"
                />
              </span>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          {/* Button */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-[#2f6fed] hover:bg-[#255cd6] transition 
            text-white py-3 rounded-lg font-medium shadow-md"
          >
            {loading ? "Loading..." : "Buat Akun"}
          </button>

          {/* GOOGLE */}
          <div id="google-btn" className="w-full flex justify-center"></div>

          {/* Login */}
          <p className="text-center text-sm text-gray-500">
            Sudah Punya Akun?{" "}
            <span
              onClick={onSwitchToLogin}
              className="text-[#2f6fed] cursor-pointer"
            >
              Masuk
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}