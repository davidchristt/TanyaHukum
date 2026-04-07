"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SubscriptionList({ user, onComplete }) {
  const [selected, setSelected] = useState("basic");
  const [step, setStep] = useState("select");
  
  const [popupStatus, setPopupStatus] = useState(null); 
  const router = useRouter();

  const plans = [
    {
      id: "basic",
      name: "Basic",
      price: "Gratis!",
      color: "from-[#D3FBFF] to-white", // ✅ tambah ini
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
      color: "from-[#B3E5FC] to-white", // beda warna
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

  // FUNGSI BARU UNTUK SIMULASI CEK PEMBAYARAN
  const handleCheckPayment = () => {
    setPopupStatus("loading"); // Munculkan pop-up loading

    // Simulasi nunggu respon backend selama 2.5 detik
    setTimeout(() => {
      setPopupStatus("success"); // Ubah pop-up jadi sukses
    }, 2500);
  };

  return (
    <>
      {/* ================== STEP 1: SELECT (UI KAMU - TETAP) ================== */}
      {step === "select" && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center">
          
          {/* BACKDROP */}
          <div className="absolute inset-0 bg-white/20 backdrop-blur-sm" />

          {/* MODAL */}
          <div className="relative z-10 w-full max-w-[900px] mx-auto px-4">
            
            {/* CLOSE BUTTON */}
            <button
              onClick={() => {
                if (onComplete) onComplete();
                else router.back();
              }}
              className="absolute -top-3 -right-3 w-10 h-10 rounded-full 
              bg-black shadow flex items-center justify-center hover:bg-gray-100"
            >
              ✕
            </button>

            <div className="bg-white rounded-3xl shadow-xl px-12 py-10 w-full text-center">
              
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
                      bg-gradient-to-b ${plan.color}`}
                    >
                      <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        {plan.name}
                      </h2>

                      <p className="text-lg font-semibold text-gray-900 mb-4">
                        {plan.price}
                      </p>

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
                            setSelected("pro");
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
              <div className="w-full flex items-center justify-center bg-gray-100 p-4 border-2 border-dashed border-gray-300 rounded-lg relative">
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
            <a 
              href="/icons/qris.svg" 
              download="QRIS_TanyaHukum.svg" // Nama file saat terdownload di HP/Laptop user
              className="w-full py-3 bg-[#C8F3F7] hover:bg-[#A9E9EF] text-black font-semibold rounded-full flex items-center justify-center gap-2 mb-4 transition cursor-pointer"
            >
              <img
                src="/icons/unduh.svg"
                alt="Unduh Icon"
                className="w-5 h-5"
              />
              Unduh
            </a>

            {/* TOMBOL DIUBAH MENJADI CEK STATUS PEMBAYARAN */}
            <button
              onClick={handleCheckPayment}
              className="w-full py-3 bg-[#3B9AFA] hover:bg-[#2A85DF] text-white font-semibold rounded-full shadow-md transition"
            >
              Cek Status Pembayaran
            </button>

            {/* Tombol Batal/Kembali */}
            <button
              onClick={() => setStep("select")}
              className="w-full mt-4 text-center text-sm text-gray-400 hover:text-gray-600 underline"
            >
              Kembali pilih paket
            </button>
          </div>
        </div>
      )}

      {/* ================== POP-UP MODAL (MENUNGGU & SUKSES) ================== */}
      {popupStatus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-10 backdrop-blur-sm">
          <div className="bg-white w-[400px] p-8 rounded-3xl shadow-2xl flex flex-col items-center text-center transform transition-all scale-100">
            
            {/* Tampilan saat Loading */}
            {popupStatus === "loading" && (
              <>
                {/* Animasi Spinner */}
                <svg className="animate-spin h-16 w-16 text-[#3B9AFA] mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Menunggu Verifikasi</h3>
                <p className="text-gray-500">Mohon tunggu sebentar, kami sedang mengecek pembayaran Anda...</p>
              </>
            )}

            {/* Tampilan saat Berhasil */}
            {popupStatus === "success" && (
              <>
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
                  <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Pembayaran Berhasil!</h3>
                <p className="text-gray-500 mb-6">Terima kasih, langganan {selectedPlan.name} Anda sekarang sudah aktif.</p>
                
                <button
                  onClick={() => {
                    setPopupStatus(null);
                    // JIKA ada onComplete (di modal), maka tutup modal. 
                    // JIKA TIDAK ada (di page subscription biasa), balik ke chatbot.
                    if (onComplete) {
                      onComplete();
                    } else {
                      router.push('/chatbot');
                    }
                  }}
                  className="w-full py-3 bg-[#3B9AFA] hover:bg-[#2A85DF] text-white font-semibold rounded-xl shadow-md transition"
                >
                  Mulai Gunakan Pro
                </button>
              </>
            )}

          </div>
        </div>
      )}
    </>
  );
}