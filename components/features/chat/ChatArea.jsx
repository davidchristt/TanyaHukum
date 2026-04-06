"use client";
import Header from "@/components/features/layout/Header"; 

export default function ChatArea({ onOpenSub }) { // Terima props ini
  return (
    <div className="h-full bg-white/80 backdrop-blur-md rounded-2xl shadow-lg flex flex-col overflow-hidden relative">
      
      {/* Teruskan fungsi buka modal ke Header */}
      <div className="border-b border-gray-200">
        <Header 
          isPro={false} 
          onOpenSubscription={onOpenSub} 
        />
      </div>

      {/* Content Area (Tetap sama) */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <h1 className="text-4xl font-semibold text-gray-900 mb-2 text-center">
          Halo Sobat Indonesia!!
        </h1>
        <p className="text-gray-600 mb-10 text-center text-lg">
          Mau Tanya Hukum Apa Hari Ini??
        </p>

        <div className="w-full max-w-2xl flex border-2 border-blue-100 rounded-2xl overflow-hidden focus-within:border-blue-400 bg-white transition-all shadow-sm">
          <input
            type="text"
            placeholder="Ketik Pertanyaan Hukum Anda di sini..."
            className="flex-1 px-6 py-4 outline-none text-gray-800 placeholder-gray-400 bg-transparent"
          />
          <button className="px-6 flex items-center hover:bg-blue-50 transition border-l border-blue-50">
            <img src="/icons/sendChat.svg" className="w-6 h-6" alt="Send" />
          </button>
        </div>
      </div>
    </div>
  );
}