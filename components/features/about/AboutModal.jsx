import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

export default function AboutModal({ onOpenAuth }) {
  const [isOpen, setIsOpen] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const hideAboutModal = localStorage.getItem("hide_about_modal");
    const user = localStorage.getItem("user");
    
    // Show if guest AND they haven't opted out
    if (!user && hideAboutModal !== "true") {
      setIsOpen(true);
    }
  }, []);

  // Lock scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "auto";
      };
    }
  }, [isOpen]);

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem("hide_about_modal", "true");
    }
    setIsOpen(false);
  };

  const handleAction = (mode) => {
    if (dontShowAgain) {
      localStorage.setItem("hide_about_modal", "true");
    }
    setIsOpen(false);
    onOpenAuth(mode);
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/20 backdrop-blur-md transition-all duration-500 animate-in fade-in">
      <div 
        className="relative w-full max-w-lg mx-4 bg-white rounded-[2rem] shadow-2xl overflow-hidden transform transition-all duration-500 animate-in zoom-in-95 slide-in-from-bottom-20"
      >
        {/* Header/Banner */}
        <div className="h-32 bg-gradient-to-r from-[#2f6fed] to-[#4a89ff] relative flex items-center justify-center">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
          <img src="/icons/logo.svg" className="w-20 h-20 bg-white p-3 rounded-2xl shadow-lg transform -rotate-3" alt="Logo" />
        </div>

        <div className="p-8 pt-10 text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Selamat Datang di TanyaHukum</h2>
          
          <div className="space-y-4 text-gray-600 leading-relaxed text-sm">
            <p>
              <span className="font-bold text-[#2f6fed]">TanyaHukum</span> adalah asisten hukum virtual cerdas berbasis teknologi RAG (Retrieval-Augmented Generation) yang dirancang khusus untuk hukum di Indonesia.
            </p>
            <p>
              Kami hadir untuk membantu Anda memahami berbagai masalah hukum dengan penjelasan yang jelas, akurat, dan mudah dimengerti.
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-3">Dikembangkan Oleh</p>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
              {["Kresna Bayu", "Dzacky Ahmad", "Fawwaz Areefa", "David Christian", "Azmi Naifah"].map((name) => (
                <span key={name} className="text-xs font-semibold text-gray-500 bg-gray-50 px-3 py-1 rounded-full">{name}</span>
              ))}
            </div>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-4">
            <button
              onClick={() => handleAction("register")}
              className="py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl transition-all active:scale-[0.98]"
            >
              Daftar
            </button>
            <button
              onClick={() => handleAction("login")}
              className="py-4 bg-[#2f6fed] hover:bg-[#255cd6] text-white font-bold rounded-2xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98]"
            >
              Masuk
            </button>
          </div>

          {/* Preferences */}
          <div className="mt-6 flex flex-col items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-[#2f6fed] focus:ring-[#2f6fed]"
              />
              <span className="text-xs font-medium text-gray-400 group-hover:text-gray-600 transition-colors">
                Jangan tampilkan lagi
              </span>
            </label>

            <button
              onClick={handleClose}
              className="text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors"
            >
              Nanti Saja
            </button>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
    </div>,
    document.body
  );
}
