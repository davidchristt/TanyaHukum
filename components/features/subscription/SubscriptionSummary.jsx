"use client";

import { useState } from "react";

export default function SubscriptionSummary({
  user,
  selectedPlan,
  onBack,
  onPay,
  isLoading = false,
  embedded = false,
}) {
  const [agree, setAgree] = useState(false);

  const userName = user?.name || "User";
  const userEmail = user?.email || "user@email.com";

  const Content = () => (
    <>
      {/* Header — compact in embedded mode */}
      {!embedded ? (
        <div className="text-center mb-7">
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight transition-colors">
            Ringkasan Pembelian
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 font-medium transition-colors">
            Pastikan detail sebelum melanjutkan pembayaran
          </p>
        </div>
      ) : (
        <div className="mb-6">
          <h2 className="text-lg font-black text-gray-900 dark:text-white tracking-tight transition-colors">
            Konfirmasi Pembelian
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium transition-colors">
            Pastikan detail sebelum melanjutkan pembayaran
          </p>
        </div>
      )}

      {/* User Info */}
      <div className="flex items-center gap-3.5 mb-5 bg-gray-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-gray-100 dark:border-slate-700 transition-colors">
        {/* Avatar */}
        <div className="w-11 h-11 rounded-full shrink-0 overflow-hidden bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center border border-blue-200/50 dark:border-blue-800/30 transition-colors">
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              className="w-full h-full object-cover rounded-full"
              alt={user?.name || "Profile"}
            />
          ) : (
            <img
              src="/icons/profile.svg"
              className="w-6 h-6 opacity-50 dark:invert"
              alt="Default profile"
            />
          )}
        </div>

        {/* Name & Email */}
        <div className="min-w-0 flex-1">
          <p className="font-bold text-gray-900 dark:text-white text-sm truncate leading-tight transition-colors">
            {userName}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5 transition-colors">
            {userEmail}
          </p>
        </div>

        {/* Badges */}
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <div className="px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[9px] font-black uppercase tracking-wider rounded-full border border-emerald-200/60 dark:border-emerald-900/30 transition-colors">
            Terverifikasi
          </div>
          {user?.tier === "PRO" && (
            <div className="px-2.5 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[9px] font-black uppercase tracking-wider rounded-full border border-blue-100 dark:border-blue-900/30 transition-colors">
              PRO
            </div>
          )}
        </div>
      </div>

      {/* Plan Detail */}
      <div className="rounded-2xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800/60 p-5 mb-5 transition-colors">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1 transition-colors">Paket Dipilih</p>
            <h3 className="font-black text-lg text-gray-900 dark:text-white tracking-tight transition-colors">
              {selectedPlan.name}
            </h3>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1 transition-colors">Total</p>
            <span className="text-xl font-black text-blue-600 dark:text-blue-400 transition-colors">
              {selectedPlan.price}
            </span>
          </div>
        </div>

        <div className="border-t border-gray-100 dark:border-slate-700 pt-4 transition-colors">
          <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2.5 transition-colors">Fitur Termasuk</p>
          <ul className="space-y-2">
            {selectedPlan.benefits.map((b, i) => (
              <li key={i} className="flex items-center gap-2.5 text-xs text-gray-600 dark:text-gray-300 font-medium transition-colors">
                <div className="w-4 h-4 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/30 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                {b}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Terms & Conditions */}
      <details className="mb-5 text-sm border border-gray-100 dark:border-slate-700 rounded-2xl overflow-hidden transition-colors group">
        <summary className="cursor-pointer font-bold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-slate-800/60 px-5 py-3.5 flex items-center justify-between select-none transition-colors">
          <span className="text-xs font-black uppercase tracking-wider text-gray-600 dark:text-gray-400">Syarat &amp; Ketentuan Berlangganan</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 dark:text-gray-500 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </summary>

        <div className="px-5 py-4 space-y-3 text-gray-500 dark:text-gray-400 leading-relaxed text-xs transition-colors bg-white dark:bg-slate-900/50">
          <p>Dengan melakukan pembayaran, Anda akan mendapatkan akses penuh ke fitur PRO termasuk chatbot tanpa batas dan pencarian dokumen hukum lanjutan.</p>
          <p>Pembayaran bersifat final dan tidak dapat dikembalikan (non-refundable), kecuali terdapat kesalahan sistem yang valid.</p>
          <p>Status akun akan otomatis diperbarui setelah sistem menerima konfirmasi pembayaran dari Midtrans.</p>
          <p>Dalam kondisi tertentu, proses aktivasi dapat memerlukan waktu beberapa saat tergantung metode pembayaran yang digunakan.</p>
          <p>Penyalahgunaan layanan dapat menyebabkan pembatasan atau penghentian akses tanpa pemberitahuan.</p>
        </div>
      </details>

      {/* Checkbox Agreement */}
      <label className="flex gap-3 items-start cursor-pointer mb-6 group">
        <input
          type="checkbox"
          checked={agree}
          onChange={(e) => setAgree(e.target.checked)}
          className="mt-0.5 w-4 h-4 rounded border-gray-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 dark:bg-slate-700 accent-blue-500"
        />
        <span className="text-xs text-gray-600 dark:text-gray-400 font-medium leading-relaxed group-hover:text-gray-800 dark:group-hover:text-gray-300 transition-colors">
          Saya menyetujui syarat &amp; ketentuan berlangganan yang berlaku
        </span>
      </label>

      {/* Pay Button */}
      <button
        onClick={onPay}
        disabled={!agree || isLoading}
        className={`w-full py-3.5 rounded-2xl font-bold text-sm transition-all active:scale-[0.98] ${
          agree && !isLoading
            ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 dark:shadow-none"
            : "bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-gray-500 cursor-not-allowed border border-gray-200 dark:border-slate-700"
        }`}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Memproses Pembayaran...
          </span>
        ) : (
          "Bayar Sekarang"
        )}
      </button>

      <p className="text-center mt-4 text-[10px] text-gray-400 dark:text-gray-500 font-medium transition-colors">
        Pembayaran diproses aman melalui Midtrans
      </p>
    </>
  );

  // When embedded inside SubscriptionList shell, render content directly
  if (embedded) {
    return <Content />;
  }

  // Standalone mode — render own card wrapper with back button
  return (
    <div className="relative w-full max-w-[480px] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-8 border border-transparent dark:border-slate-800 transition-colors">
      {/* Back/Close button for standalone */}
      <button
        onClick={onBack}
        className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-slate-700 hover:text-gray-700 dark:hover:text-gray-300 transition-all"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <Content />
    </div>
  );
}