"use client";

import { useState, useEffect } from "react";

// Kategori yang tersedia sesuai backend
const CATEGORIES = ["Semua", "Ketenagakerjaan", "Perdata"];

export default function DataList() {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // State untuk API temen bos
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Debounce: Tunggu 500ms setelah ngetik baru cari
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset ke halaman 1 kalau ganti pencarian/kategori
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, activeCategory]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Susun query parameter buat backend
        const params = new URLSearchParams();
        params.append("page", currentPage);
        if (debouncedSearch) params.append("search", debouncedSearch);
        if (activeCategory !== "Semua") params.append("category", activeCategory);

        // Tembak API yang udah dibikin temen
        const response = await fetch(`/api/regulations?${params.toString()}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        // Sesuaikan dengan response JSON backend
        if (result.data && Array.isArray(result.data)) {
          setDocuments(result.data);
          setTotalPages(result.meta?.totalPages || 1);
        } else {
          console.error("Format data tidak sesuai:", result);
          setDocuments([]);
        }

      } catch (error) {
        console.error("Gagal mengambil data regulasi:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [debouncedSearch, activeCategory, currentPage]);

  // Fungsi untuk membuka link file (Tombol Baca)
  const handleOpenFile = (url) => {
    if (url) {
      window.open(url, '_blank');
    } else {
      alert("Link file tidak tersedia.");
    }
  };

  // Fungsi khusus untuk memaksa unduhan (Tombol Unduh)
  const handleDownloadFile = (url) => {
    if (!url) {
      alert("Link file tidak tersedia.");
      return;
    }

    // Trik memaksa download dengan atribut 'download' dan parameter Supabase
    const downloadUrl = url.includes('?') ? `${url}&download=` : `${url}?download=`;

    const link = document.createElement("a");
    link.href = downloadUrl;
    link.setAttribute("download", ""); // Memberi tahu browser ini file untuk diunduh
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="h-full bg-[#EAF2FA] rounded-[32px] p-8 flex flex-col shadow-sm border border-blue-100 overflow-y-auto overflow-x-hidden">

      {/* Search Section */}
      <div className="bg-white border border-[#A6D4FF] rounded-2xl p-8 mb-10 w-full max-w-4xl mx-auto shadow-sm flex-shrink-0">

        <div className="text-center mb-6">
          <p className="text-gray-900 font-semibold text-lg">
            Pencarian Jaringan Dokumentasi dan Informasi Hukum Nasional (JDIHN)
          </p>
          <p className="text-gray-600 text-sm mt-1">
            Cari Undang-undang Peraturan Pemerintah, Putusan MA secara Akurat dan Resmi
          </p>
        </div>

        <div className="relative flex items-center mb-6">
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

        {/* Filter Kategori Baru */}
        <div className="flex flex-wrap justify-center gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${activeCategory === cat
                ? "bg-blue-600 text-white shadow-md"
                : "bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200"
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="w-full max-w-4xl mx-auto flex-1 pb-10">

        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
          {searchQuery || activeCategory !== "Semua" ? "Hasil Pencarian" : "Dokumen Terpopuler"}
        </h2>

        {isLoading ? (
          <div className="flex flex-col items-center py-20 gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500"></div>
            <p className="text-blue-500 font-medium">Memuat Dokumen...</p>
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-10 text-gray-500 bg-white rounded-2xl border border-dashed border-gray-300">
            Tidak ada dokumen yang ditemukan.
          </div>
        ) : (
          <div className="space-y-4">
            {documents.map((item, i) => (
              <div
                key={item.id || i}
                className="flex justify-between items-center p-5 bg-white 
                border border-[#A6D4FF] rounded-2xl 
                hover:shadow-md transition"
              >

                {/* Left */}
                <div className="flex items-center gap-4 flex-1 min-w-0 pr-4">
                  <div className="min-w-[48px] w-12 h-12 flex items-center justify-center bg-blue-50 rounded-xl shrink-0">
                    <img
                      src="/icons/dokumenTerpopuler.svg"
                      className="w-6 h-6"
                      alt="doc"
                    />
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-gray-900 font-semibold line-clamp-2">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      {item.category && (
                        <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded uppercase font-bold shrink-0">
                          {item.category}
                        </span>
                      )}
                      <p className="text-sm text-gray-600 line-clamp-1 truncate">
                        {item.description || "Tidak ada deskripsi"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right */}
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handleOpenFile(item.fileUrl)}
                    className="px-4 py-2 border border-[#A6D4FF] rounded-xl 
                    text-gray-700 font-medium 
                    hover:bg-blue-50 transition active:scale-95"
                  >
                    Baca
                  </button>

                  {/* Tombol Unduh yang sudah diperbaiki error JSX-nya */}
                  <button
                    onClick={() => handleDownloadFile(item.fileUrl)}
                    className="px-4 py-2 border border-[#A6D4FF] rounded-xl 
                    text-gray-700 font-medium 
                    hover:bg-blue-50 transition active:scale-95"
                  >
                    Unduh
                  </button>
                </div>

              </div>
            ))}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8 pt-4 border-t border-blue-100">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white border border-[#A6D4FF] rounded-xl text-gray-700 font-medium hover:bg-blue-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sebelumnya
                </button>
                <span className="text-sm font-medium text-gray-600">
                  Halaman {currentPage} dari {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-white border border-[#A6D4FF] rounded-xl text-gray-700 font-medium hover:bg-blue-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Selanjutnya
                </button>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}