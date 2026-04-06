"use client";
import { useState, useEffect } from "react"; // Tambahkan Hooks untuk data
import Header from "@/components/features/layout/Header";

export default function DataList({ onOpenSub }) {
  // 1. STATE: Tempat menyimpan data dari Database/API
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 2. EFFECT: Simulasi mengambil data dari Backend saat halaman dibuka
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // SIMULASI: Nanti baris ini diganti dengan fetch("link-api-kamu")
        // const response = await fetch("/api/v1/documents");
        // const data = await response.json();

        // Kita simulasi loading selama 1.5 detik biar kerasa "kerja"-nya
        setTimeout(() => {
          const mockFromDatabase = [
            { 
              title: "Undang-Undang Nomor 1 Tahun 2025", 
              desc: "Perubahan mengenai UU ITE 2021 (Data Live)" 
            },
            { 
              title: "Peraturan Pemerintah No. 12 Tahun 2024", 
              desc: "Ketentuan Pajak Digital Nasional" 
            },
            { 
              title: "Putusan MA Nomor 45/Pdt.G/2025", 
              desc: "Yurisprudensi Sengketa Lahan Elektronik" 
            },
            { 
              title: "Undang-Undang Nomor 5 Tahun 2024", 
              desc: "Pelindungan Data Pribadi Versi Terbaru" 
            },
            { 
              title: "Keputusan Menteri Hukum No. 102", 
              desc: "Tata Cara Bantuan Hukum Gratis" 
            },
          ];
          
          setDocuments(mockFromDatabase);
          setIsLoading(false);
        }, 1500);

      } catch (error) {
        console.error("Gagal mengambil data hukum:", error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="h-full bg-[#EAF2FA] rounded-[32px] p-8 flex flex-col relative shadow-sm border border-blue-100 overflow-y-auto">
      
      {/* 1. Header Area */}
      <div className="mb-6">
        <Header 
          isPro={false} 
          onOpenSubscription={onOpenSub} 
        />
      </div>

      {/* 2. Kotak Pencarian Besar (JDIHN Branding) */}
      <div className="bg-white border border-[#A6D4FF] rounded-2xl p-8 mb-10 w-full max-w-4xl mx-auto shadow-sm">
        <div className="text-center mb-6">
          <p className="text-gray-800 font-semibold text-lg">
            Pencarian Jaringan Dokumentasi dan Informasi Hukum Nasional (JDIHN)
          </p>
          <p className="text-gray-500 text-sm mt-1">
            Cari Undang-undang Peraturan Pemerintah, Putusan MA secara Akurat dan Resmi
          </p>
        </div>
        
        <div className="relative flex items-center group">
          <img 
            src="/icons/search.svg" 
            className="w-5 h-5 absolute left-5 text-blue-400 opacity-60" 
            alt="Search"
          />
          <input 
            type="text" 
            placeholder="Misal, Hukum mengenai saksi kejahatan tahun 2025" 
            className="w-full pl-14 pr-14 py-4 border border-[#A6D4FF] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-700 bg-white transition-all shadow-inner"
          />
          <button className="absolute right-5 hover:scale-110 transition">
            <img src="/icons/filter.svg" className="w-5 h-5" alt="Filter" />
          </button>
        </div>
      </div>

      {/* 3. Section Dokumen Terpopuler */}
      <div className="w-full max-w-4xl mx-auto flex-1">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-8">
          Dokumen Terpopuler
        </h2>

        {/* LOADING STATE: Muncul spinner kalau data lagi diambil */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500"></div>
            <p className="text-blue-400 font-medium animate-pulse">Menghubungkan ke JDIHN...</p>
          </div>
        ) : (
          <div className="space-y-4 pb-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {documents.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-5 bg-white border border-[#A6D4FF] rounded-2xl hover:shadow-md transition group"
              >
                {/* Sisi Kiri: Info Dokumen */}
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-[#F0F7FF] rounded-xl flex items-center justify-center border border-blue-50">
                    <img 
                      src="/icons/dokumenTerpopuler.svg" 
                      className="w-8 h-8" 
                      alt="File Icon" 
                    />
                  </div>
                  <div>
                    <h3 className="text-gray-900 font-bold text-base group-hover:text-blue-600 transition">
                      {item.title}
                    </h3>
                    <p className="text-gray-500 text-sm mt-0.5">{item.desc}</p>
                  </div>
                </div>

                {/* Sisi Kanan: Action Buttons */}
                <div className="flex items-center gap-3">
                  <button className="flex items-center gap-2 px-5 py-2 border border-[#A6D4FF] rounded-xl text-gray-700 text-sm font-semibold hover:bg-blue-50 transition active:scale-95">
                    <img src="/icons/baca.svg" className="w-4 h-4" alt="Baca" />
                    Baca
                  </button>
                  <button className="flex items-center gap-2 px-5 py-2 border border-[#A6D4FF] rounded-xl text-gray-700 text-sm font-semibold hover:bg-blue-50 transition active:scale-95">
                    <img src="/icons/unduh.svg" className="w-4 h-4" alt="Unduh" />
                    Unduh
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}