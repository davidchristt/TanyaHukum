"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { requestPasswordReset, resetPassword } from "../../../src/lib/auth";

export default function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleRequestReset = async () => {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const data = await requestPasswordReset({ email });
      setMessage(data.message);

      if (data.resetUrl) {
        router.push(data.resetUrl.replace(window.location.origin, ""));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setLoading(true);
    setError("");
    setMessage("");

    if (password !== confirmPassword) {
      setError("Password tidak sama");
      setLoading(false);
      return;
    }

    try {
      await resetPassword({ token, newPassword: password });

      setMessage("Password berhasil diubah");

      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/5 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="relative w-full max-w-md bg-white p-10 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.1)]">

        {/* CLOSE */}
        <button
          onClick={() => router.back()}
          className="absolute top-4 right-4 text-[#2f6fed] hover:text-white 
          hover:bg-[#2f6fed] transition p-2 rounded-full"
        >
          ✕
        </button>

        <h2 className="text-2xl font-semibold text-center text-gray-900 mb-8">
          {token ? "Reset Password" : "Lupa Password"}
        </h2>

        <div className="space-y-5">
          {/* MODE EMAIL */}
          {!token && (
            <>
              <input
                type="email"
                placeholder="Masukkan Email Anda"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg 
                focus:outline-none focus:ring-2 focus:ring-[#2f6fed]"
              />

              <button
                onClick={handleRequestReset}
                disabled={loading}
                className="w-full bg-[#2f6fed] hover:bg-[#255cd6] transition 
                text-white py-3 rounded-lg font-medium shadow-md"
              >
                {loading ? "Loading..." : "Kirim Link Reset"}
              </button>
            </>
          )}

          {/* MODE RESET PASSWORD */}
          {token && (
            <>
              {/* Password */}
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password baru"
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

              {/* Confirm Password */}
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Konfirmasi password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg 
                focus:outline-none focus:ring-2 focus:ring-[#2f6fed]"
              />

              <button
                onClick={handleResetPassword}
                disabled={loading}
                className="w-full bg-[#2f6fed] hover:bg-[#255cd6] transition 
                text-white py-3 rounded-lg font-medium shadow-md"
              >
                {loading ? "Loading..." : "Reset Password"}
              </button>
            </>
          )}

          {/* ERROR */}
          {error && <p className="text-red-500 text-sm">{error}</p>}

          {/* SUCCESS */}
          {message && <p className="text-green-500 text-sm">{message}</p>}
        </div>
      </div>
    </div>
  );
}