"use client";

import { createPortal } from "react-dom";

export default function SubscriptionModal({ isOpen, onClose, user }) {
  if (!isOpen) return null;

  const plans = [
    {
      name: "Free",
      price: "Rp 0",
      description: "Untuk eksplorasi awal hukum",
      features: [
        "10 chat per hari",
        "Akses dasar pusat data",
        "Tanpa analisis mendalam",
        "Respon standar"
      ],
      current: user?.tier !== "PRO",
      buttonText: "Paket Saat Ini",
      buttonClass: "bg-gray-100 text-gray-500 cursor-default"
    },
    {
      name: "Pro Member",
      price: "Rp 99k",
      period: "/bulan",
      description: "Untuk profesional & mahasiswa hukum",
      features: [
        "Unlimited AI Legal Search",
        "Premium Analytics Access",
        "Exclusive Regulation Insights",
        "Priority Legal Updates",
        "Unduh Laporan Analisis PDF"
      ],
      current: user?.tier === "PRO",
      buttonText: user?.tier === "PRO" ? "Paket Saat Ini" : "Upgrade Sekarang",
      buttonClass: user?.tier === "PRO" 
        ? "bg-emerald-100 text-emerald-700 cursor-default" 
        : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200"
    }
  ];

  return createPortal(
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-md animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-300 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 z-20 p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 transition-all active:scale-90"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="grid grid-cols-1 md:grid-cols-5 h-full">
          {/* Left Info Panel */}
          <div className="md:col-span-2 bg-blue-600 p-12 text-white flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-md">
                <img src="/icons/bintangPro.svg" className="w-6 h-6 brightness-0 invert" alt="Pro" />
              </div>
              <h2 className="text-3xl font-black mb-4 leading-tight">Buka Potensi Penuh TanyaHukum</h2>
              <p className="text-blue-100 font-medium leading-relaxed">
                Tingkatkan pengalaman Anda dengan fitur premium yang dirancang untuk efisiensi riset hukum Anda.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04c-.233.63-.362 1.31-.362 2.016 0 5.867 3.34 10.971 8.25 13.25a11.959 11.959 0 018.25-13.25c0-.706-.129-1.386-.362-2.016z" />
                  </svg>
                </div>
                <p className="text-sm font-bold">Aman & Terpercaya</p>
              </div>
              <p className="text-[10px] text-blue-200 font-black uppercase tracking-[0.2em]">Verified Intelligence</p>
            </div>
          </div>

          {/* Right Pricing Panel */}
          <div className="md:col-span-3 p-12 flex flex-col justify-center bg-gray-50/50">
            <div className="grid grid-cols-1 gap-6">
              {plans.map((plan, i) => (
                <div 
                  key={i} 
                  className={`bg-white rounded-[2rem] p-8 border-2 transition-all relative ${
                    plan.name === "Pro Member" ? "border-blue-600 shadow-xl shadow-blue-100" : "border-gray-100"
                  }`}
                >
                  {plan.name === "Pro Member" && (
                    <div className="absolute -top-4 left-8 px-4 py-1 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
                      Recommended
                    </div>
                  )}
                  
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-black text-gray-900">{plan.name}</h3>
                      <p className="text-xs text-gray-500 font-medium">{plan.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-gray-900">{plan.price}</p>
                      {plan.period && <p className="text-[10px] text-gray-400 font-bold uppercase">{plan.period}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-y-3 gap-x-4 mb-8">
                    {plan.features.map((feat, j) => (
                      <div key={j} className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${plan.name === "Pro Member" ? "text-blue-600" : "text-gray-300"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-[11px] font-bold text-gray-600">{feat}</span>
                      </div>
                    ))}
                  </div>

                  <button 
                    className={`w-full py-4 rounded-2xl font-bold text-sm transition-all active:scale-[0.98] ${plan.buttonClass}`}
                  >
                    {plan.buttonText}
                  </button>
                </div>
              ))}
            </div>
            
            <p className="text-center mt-8 text-[10px] text-gray-400 font-medium px-8">
              Dengan berlangganan, Anda menyetujui Ketentuan Layanan dan Kebijakan Privasi TanyaHukum. Pembatalan dapat dilakukan kapan saja.
            </p>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
