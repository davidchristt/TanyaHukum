"use client";

import { useState, useEffect } from "react";

export default function DataList() {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        setTimeout(() => {
          const mockFromDatabase = [
            { title: "Undang-Undang Nomor 1 Tahun 2025", desc: "Perubahan mengenai UU ITE 2021 (Data Live)" },
            { title: "Peraturan Pemerintah No. 12 Tahun 2024", desc: "Ketentuan Pajak Digital Nasional" },
            { title: "Putusan MA Nomor 45/Pdt.G/2025", desc: "Yurisprudensi Sengketa Lahan Elektronik" },
            { title: "Undang-Undang Nomor 5 Tahun 2024", desc: "Pelindungan Data Pribadi Versi Terbaru" },
            { title: "Keputusan Menteri Hukum No. 102", desc: "Tata Cara Bantuan Hukum Gratis" },
          ];

          setDocuments(mockFromDatabase);
          setIsLoading(false);
        }, 1500);
      } catch (error) {
        console.error("Gagal mengambil data:", error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="h-full bg-[#EAF2FA] rounded-[32px] p-8 flex flex-col shadow-sm border border-blue-100 overflow-y-auto">
      
      {/* Search Section */}
      <div className="bg-white border border-[#A6D4FF] rounded-2xl p-8 mb-10 w-full max-w-4xl mx-auto shadow-sm">
        
        <div className="text-center mb-6">
          <p className="text-gray-900 font-semibold text-lg">
            Pencarian Jaringan Dokumentasi dan Informasi Hukum Nasional (JDIHN)
          </p>
          <p className="text-gray-600 text-sm mt-1">
            Cari Undang-undang Peraturan Pemerintah, Putusan MA secara Akurat dan Resmi
          </p>
        </div>

        <div className="relative flex items-center">
          <img
            src="/icons/search.svg"
            className="w-5 h-5 absolute left-5 opacity-70"
            alt="search"
          />
          <input
            type="text"
            placeholder="Misal, Hukum mengenai saksi kejahatan tahun 2025"
            className="w-full pl-14 pr-14 py-4 border border-[#A6D4FF] rounded-xl 
            focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-800"
          />
          <button className="absolute right-5 hover:scale-110 transition">
            <img src="/icons/filter.svg" className="w-5 h-5" alt="filter" />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="w-full max-w-4xl mx-auto flex-1">
        
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
          Dokumen Terpopuler
        </h2>

        {isLoading ? (
          <div className="flex flex-col items-center py-20 gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500"></div>
            <p className="text-blue-500 font-medium">Loading...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {documents.map((item, i) => (
              <div
                key={i}
                className="flex justify-between items-center p-5 bg-white 
                border border-[#A6D4FF] rounded-2xl 
                hover:shadow-md transition"
              >
                
                {/* Left */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 flex items-center justify-center bg-blue-50 rounded-xl">
                    <img
                      src="/icons/dokumenTerpopuler.svg"
                      className="w-6 h-6"
                      alt="doc"
                    />
                  </div>

                  <div>
                    <h3 className="text-gray-900 font-semibold">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {item.desc}
                    </p>
                  </div>
                </div>

                {/* Right */}
                <div className="flex gap-2">
                  <button
                    className="px-4 py-2 border border-[#A6D4FF] rounded-xl 
                    text-gray-700 font-medium 
                    hover:bg-blue-50 transition active:scale-95"
                  >
                    Baca
                  </button>

                  <button
                    className="px-4 py-2 border border-[#A6D4FF] rounded-xl 
                    text-gray-700 font-medium 
                    hover:bg-blue-50 transition active:scale-95"
                  >
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