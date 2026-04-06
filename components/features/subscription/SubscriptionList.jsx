"use client";
import { useState } from "react";

// Menambahkan parameter 'user' dengan nilai default agar tetap aman 
// meskipun belum ada data dari backend/page.js
export default function SubscriptionList({ user }) {
  const [selected, setSelected] = useState("basic");
  const [step, setStep] = useState("select");

  const plans = [
    {
      id: "basic",
      name: "Basic",
      price: "Gratis!",
      benefits: [
        "Prompt chatbot terbatas",
        "Pencarian dokumen terbatas",
        "Memori maksimal di seluruh obrolan",
      ],
    },
    {
      id: "pro",
      name: "Pro",
      price: "Rp 49.900,00",
      benefits: [
        "Prompt chatbot tanpa batas",
        "Pencarian dokumen tanpa batas",
        "Memori diperluas di seluruh obrolan",
      ],
    },
  ];

  const selectedPlan = plans.find((p) => p.id === selected);

  // Fallback data agar kalau user kosong, tetap muncul David sesuai desainmu
  const userName = user?.name || "David";
  const userEmail = user?.email || "David@Gmail.Com";

  return (
    <>
      {/* ================== STEP 1: SELECT (UI KAMU - TETAP) ================== */}
      {step === "select" && (
        <div className="bg-white rounded-3xl shadow-xl px-12 py-10 w-[850px] text-center">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">
            Pilih Paket Sesuai Kebutuhan Anda
          </h1>
          <p className="text-gray-600 mb-10">
            Dapatkan Akses Hukum tidak terbatas dengan langganan Pro!
          </p>

          <div className="flex justify-center gap-10">
            {plans.map((plan) => {
              const isSelected = selected === plan.id;

              return (
                <div
                  key={plan.id}
                  onClick={() => setSelected(plan.id)}
                  className={`w-[280px] p-6 rounded-2xl border-2 cursor-pointer transition
                  ${
                    isSelected
                      ? "border-blue-500 scale-105 shadow-lg"
                      : "border-blue-300"
                  }
                  bg-gradient-to-b from-[#D3FBFF] to-white`}
                >
                  <h2 className="text-xl font-semibold mb-2">{plan.name}</h2>
                  <p className="text-lg font-semibold mb-4">{plan.price}</p>

                  <ul className="text-sm text-gray-700 text-left space-y-2 mb-8">
                    {plan.benefits.map((b, i) => (
                      <li key={i}>• {b}</li>
                    ))}
                  </ul>

                  {plan.id === "basic" ? (
                    <button className="w-full py-2 border border-blue-300 rounded-lg text-blue-400">
                      Paket Saat Ini
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelected("pro"); // fix bug sebelumnya
                        setStep("summary");
                      }}
                      className="w-full py-2 bg-[#78CDFF] hover:bg-[#5bbef5] 
                      text-white rounded-lg shadow-md transition"
                    >
                      Beli Sekarang
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================== STEP 2: SUMMARY ================== */}
      {step === "summary" && (
        <div className="w-full max-w-[450px] flex flex-col gap-5">
          {/* Card 1: User Profile */}
          <div className="bg-white rounded-[24px] shadow-lg p-6 flex items-center gap-6">
            {/* User Avatar dari folder public/icons */}
            <div className="w-20 h-20 rounded-full border-[4px] border-[#3B9AFA] flex items-center justify-center overflow-hidden bg-blue-50">
              <img
                src="/icons/profile.svg"
                alt="Profile Icon"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-left">
              <h2 className="text-[26px] font-bold text-black leading-tight">
                {userName}
              </h2>
              <p className="text-gray-600 text-[15px]">{userEmail}</p>
            </div>
          </div>

          {/* Card 2: Subscription Details */}
          <div className="bg-white rounded-[24px] shadow-lg p-8 text-left">
            {/* Benefits */}
            <h3 className="text-[18px] font-bold text-black mb-3">Benefit</h3>
            <div className="border border-[#8ED4FF] rounded-[16px] p-5 mb-6">
              <ul className="text-black text-[15px] space-y-2 ml-1">
                {selectedPlan.benefits.map((b, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="font-bold">•</span> {b}
                  </li>
                ))}
              </ul>
            </div>

            {/* Payment Method */}
            <h3 className="text-[18px] font-bold text-black mb-3">
              Metode Pembayaran
            </h3>
            <div className="border border-[#8ED4FF] bg-gradient-to-r from-blue-50/30 via-white to-blue-50/30 rounded-full py-3 flex items-center justify-center gap-3 mb-6">
              {/* Icon QRIS dari folder public/icons */}
              <img src="/icons/qris.svg" alt="QRIS Icon" className="w-6 h-6" />
              <span className="font-bold text-black text-[20px]">Qris</span>
            </div>

            {/* Pay Button */}
            <button
              onClick={() => setStep("payment")}
              className="w-full py-3.5 bg-[#3B9AFA] hover:bg-[#2A85DF] text-white font-bold text-[16px] rounded-xl shadow-md transition"
            >
              Lanjut Ke Pembayaran
            </button>

            {/* Tombol kembali */}
            <button
              onClick={() => setStep("select")}
              className="w-full mt-4 text-center text-sm text-gray-400 hover:text-gray-600 underline"
            >
              Kembali pilih paket
            </button>
          </div>
        </div>
      )}

{/* ================== STEP 3: PAYMENT (UPDATED) ================== */}
      {step === "payment" && (
        <div className="w-full max-w-[450px] flex flex-col gap-5">
          {/* Card 1: User Profile - Sama dengan Summary agar konsisten */}
          <div className="bg-white rounded-[24px] shadow-lg p-6 flex items-center gap-6">
            {/* User Avatar dari folder public/icons */}
            <div className="w-20 h-20 rounded-full border-[4px] border-[#3B9AFA] flex items-center justify-center overflow-hidden bg-blue-50">
              <img
                src="/icons/profile.svg"
                alt="Profile Icon"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-left">
              <h2 className="text-[26px] font-bold text-black leading-tight">
                {userName}
              </h2>
              <p className="text-gray-600 text-[15px]">{userEmail}</p>
            </div>
          </div>

          {/* Card 2: Payment Detail dengan Desain Baru */}
          <div className="bg-white rounded-[24px] shadow-lg p-8 text-left">
            {/* Area Kode QR dengan branding */}
            <div className="border border-[#8ED4FF] rounded-[16px] p-5 mb-6 bg-white">
              {/* Header branding QRIS */}
              <div className="flex items-center gap-2 mb-4">
                <img
                  src="/icons/qris.svg"
                  alt="QRIS Logo"
                  className="w-12 h-6"
                />
                <span className="text-[13px] font-bold text-black">
                  QR Code Standar Pembayaran Nasional
                </span>
              </div>
              
              {/* Placeholder Kode QR Besar - Di sini gambar QR asli akan diletakkan */}
              <div className="w-full flex items-center justify-center bg-gray-100 p-4 border-2 border-dashed border-gray-300 rounded-lg">
                {/* Untuk sementara kita gunakan logo QRIS sebagai placeholder */}
                <img
                    src="/icons/qris.svg"
                    alt="QRIS Code Placeholder"
                    className="w-40 h-40 object-contain opacity-50"
                />
                <span className="text-gray-500 absolute font-semibold">PLACEHOLDER QR CODE</span>
              </div>
            </div>

            {/* Tombol Unduh */}
            <button className="w-full py-3 bg-[#C8F3F7] hover:bg-[#A9E9EF] text-black font-semibold rounded-full flex items-center justify-center gap-2 mb-4 transition">
              <img
                src="/icons/unduh.svg"
                alt="Unduh Icon"
                className="w-5 h-5"
              />
              Unduh
            </button>

            {/* Tombol Kembali (Navigasi kembali ke STEP 1: SELECT) */}
            <button
              onClick={() => setStep("select")}
              className="w-full py-3 bg-[#78CDFF] hover:bg-[#5bbef5] text-white font-semibold rounded-full shadow-md transition"
            >
              Kembali
            </button>
          </div>
        </div>
      )}
      </>
  );
}