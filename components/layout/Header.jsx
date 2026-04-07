"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Header({ isPro = false, onOpenSubscription }) {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      setUser(JSON.parse(stored));
    }
  }, []);

  return (
    <div className="w-full flex items-center justify-between px-4 py-3">
      
      {/* LEFT */}
      <div
        onClick={() => router.push("/chatbot")}
        className="flex items-center gap-3 cursor-pointer"
      >
        <img src="/icons/logo.svg" className="w-10 h-10" />
        <h1 className="text-lg font-semibold text-gray-900">
          TanyaHukum
        </h1>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-3">

        {/* BELUM LOGIN */}
        {!user && (
          <>
            <button
              onClick={() => router.push("/login")}
              className="text-sm px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Login
            </button>

            <button
              onClick={() => router.push("/register")}
              className="text-sm px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Register
            </button>
          </>
        )}

        {/* SUDAH LOGIN */}
        {user && !isPro && (
          <button
            onClick={onOpenSubscription}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 transition 
            text-white px-4 py-2 rounded-xl shadow-md text-sm font-medium"
          >
            <img src="/icons/bintangPro.svg" className="w-4 h-4" />
            Konsultasi Pro
          </button>
        )}

      </div>
    </div>
  );
}