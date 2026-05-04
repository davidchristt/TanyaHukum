"use client";

import { useState, useEffect } from "react";

export default function DataList() {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // State untuk fungsi pencarian di frontend
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch ke API yang sudah kamu siapkan untuk mengambil semua regulasi
        const response = await fetch("/api/regulations");

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Memastikan data yang diterima adalah array
        if (Array.isArray(data)) {
          setDocuments(data);
        } else {
          console.error("Format data tidak sesuai:", data);
          setDocuments([]);
        }

      } catch (error) {
        console.error("Gagal mengambil data regulasi:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fungsi untuk memfilter dokumen berdasarkan input pencarian
  const filteredDocuments = documents.filter((doc) => {
    const searchLower = searchQuery.toLowerCase();
    const titleMatch = doc.title?.toLowerCase().includes(searchLower);
    const descMatch = doc.description?.toLowerCase().includes(searchLower);
    return titleMatch || descMatch;
  });

  // Fungsi untuk membuka link file
  const handleOpenFile = (url) => {
    if (url) {
      window.open(url, '_blank');
    } else {
      alert("Link file tidak tersedia.");
    }
  };

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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-14 pr-14 py-4 border border-[#A6D4FF] rounded-xl 
            focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-800"
          />
          <button className="absolute right-5 hover:scale-110 transition text-gray-500 hover:text-blue-500">
            {/* SVG Langsung untuk ikon Filter */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5"
            >
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
            </svg>
          </button>
        </div>
      </div>

      {/* List */}
      <div className="w-full max-w-4xl mx-auto flex-1">

        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
          {searchQuery ? "Hasil Pencarian" : "Dokumen Terpopuler"}
        </h2>

        {isLoading ? (
          <div className="flex flex-col items-center py-20 gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500"></div>
            <p className="text-blue-500 font-medium">Loading...</p>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            Tidak ada dokumen yang ditemukan.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDocuments.map((item, i) => (
              <div
                key={item.id || i}
                className="flex justify-between items-center p-5 bg-white 
                border border-[#A6D4FF] rounded-2xl 
                hover:shadow-md transition"
              >

                {/* Left */}
                <div className="flex items-center gap-4">
                  <div className="min-w-12 w-12 h-12 flex items-center justify-center bg-blue-50 rounded-xl">
                    <img
                      src="/icons/dokumenTerpopuler.svg"
                      className="w-6 h-6"
                      alt="doc"
                    />
                  </div>

                  <div>
                    <h3 className="text-gray-900 font-semibold line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-1 mt-1">
                      {item.description || "Tidak ada deskripsi"}
                    </p>
                  </div>
                </div>

                {/* Right */}
                <div className="flex gap-2 shrink-0 ml-4">
                  <button
                    onClick={() => handleOpenFile(item.fileUrl)}
                    className="px-4 py-2 border border-[#A6D4FF] rounded-xl 
                    text-gray-700 font-medium 
                    hover:bg-blue-50 transition active:scale-95"
                  >
                    Baca
                  </button>

                  <button
                    onClick={() => handleOpenFile(item.fileUrl)}
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