"use client";

import { useState } from "react";

export default function SubscriptionSummary({
  user,
  selectedPlan,
  onBack,
  onPay,
  isLoading = false,
}) {
  const [agree, setAgree] = useState(false);

  const userName = user?.name || "User";
  const userEmail = user?.email || "user@email.com";

  return (
    <div className="relative w-full max-w-[480px] bg-white rounded-3xl shadow-2xl p-8">

      {/* CLOSE */}
      <button
        onClick={onBack}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition"
      >
        ✕
      </button>

      {/* ================= HEADER ================= */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          Ringkasan Pembelian
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Pastikan detail sebelum melanjutkan pembayaran
        </p>
      </div>

      {/* ================= USER ================= */}
      <div className="flex items-center gap-4 mb-6 bg-gray-50 rounded-xl p-4">
        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
          <img src="/icons/profile.svg" className="w-8 h-8" />
        </div>
        <div>
          <p className="font-semibold text-gray-900">{userName}</p>
          <p className="text-sm text-gray-500">{userEmail}</p>
        </div>
      </div>

      {/* ================= PLAN ================= */}
      <div className="border rounded-xl p-5 mb-6">

        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-lg text-gray-900">
            {selectedPlan.name}
          </h3>
          <span className="text-blue-600 font-bold">
            {selectedPlan.price}
          </span>
        </div>

        <ul className="text-sm text-gray-600 space-y-1">
          {selectedPlan.benefits.map((b, i) => (
            <li key={i}>• {b}</li>
          ))}
        </ul>

      </div>

      {/* ================= AGREEMENT ================= */}
      <details className="mb-5 text-sm text-gray-700 border rounded-xl p-4 bg-gray-50">
        <summary className="cursor-pointer font-semibold text-gray-900">
          Syarat & Ketentuan Berlangganan
        </summary>

        <div className="mt-3 space-y-3 text-gray-600 leading-relaxed">

          <p>
            Dengan melakukan pembayaran, Anda akan mendapatkan akses penuh ke
            fitur PRO termasuk chatbot tanpa batas dan pencarian dokumen hukum
            lanjutan.
          </p>

          <p>
            Pembayaran bersifat final dan tidak dapat dikembalikan
            (non-refundable), kecuali terdapat kesalahan sistem yang valid.
          </p>

          <p>
            Status akun akan otomatis diperbarui setelah sistem menerima
            konfirmasi pembayaran dari Midtrans.
          </p>

          <p>
            Dalam kondisi tertentu, proses aktivasi dapat memerlukan waktu
            beberapa saat tergantung metode pembayaran yang digunakan.
          </p>

          <p>
            Penyalahgunaan layanan dapat menyebabkan pembatasan atau
            penghentian akses tanpa pemberitahuan.
          </p>

        </div>
      </details>

      {/* ================= CHECKBOX ================= */}
      <label className="flex gap-2 items-start cursor-pointer mb-6">
        <input
          type="checkbox"
          checked={agree}
          onChange={(e) => setAgree(e.target.checked)}
          className="mt-1"
        />
        <span className="text-sm text-gray-700">
          Saya menyetujui syarat & ketentuan berlangganan
        </span>
      </label>

      {/* ================= BUTTON ================= */}
      <button
        onClick={onPay}
        disabled={!agree || isLoading}
        className={`w-full py-3 rounded-xl font-semibold transition
        ${
          agree && !isLoading
            ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md"
            : "bg-gray-200 text-gray-400 cursor-not-allowed"
        }`}
      >
        {isLoading ? "Memproses..." : "Bayar Sekarang"}
      </button>

    </div>
  );
}