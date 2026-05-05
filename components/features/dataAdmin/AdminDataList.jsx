"use client";

import { useState, useEffect } from "react";
import AdminDataItem from "./AdminDataItem";
import AdminDataModal from "./AdminDataModal";

// Kategori hardcode karena data dipanggil per halaman (pagination)
const CATEGORIES = [
  "Semua",
  "Ketenagakerjaan",
  "Perdata"
];

export default function AdminDataList() {
  const [data, setData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [itemToDelete, setItemToDelete] = useState(null);

  // State untuk Search, Kategori, dan Pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Efek Debounce agar tidak spam hit API saat mengetik
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset ke halaman 1 kalau admin ganti kategori atau ngetik pencarian baru
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, selectedCategory]);

  const getAuthHeaders = () => {
    const userDataString = localStorage.getItem("user");
    let userId = "";
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      userId = userData.id || "";
    }
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userId}`
    };
  };

  const fetchRegulations = async () => {
    setIsLoading(true);
    try {
      // Susun parameter URL untuk backend
      const params = new URLSearchParams();
      params.append("page", currentPage);
      if (debouncedSearch) params.append("search", debouncedSearch);
      if (selectedCategory !== "Semua") params.append("category", selectedCategory);

      const response = await fetch(`/api/admin/regulations?${params.toString()}`, {
        headers: getAuthHeaders(),
        credentials: 'include'
      });

      if (response.ok) {
        const result = await response.json();

        // Cek struktur response dari API baru
        if (result.data) {
          const formattedData = result.data.map(item => ({
            id: item.id,
            dokumen: item.title,
            deskripsi: item.description,
            fileUrl: item.fileUrl,
            category: item.category || "Umum"
          }));
          setData(formattedData);
          setTotalPages(result.meta?.totalPages || 1);
        } else {
          setData([]);
        }
      }
    } catch (error) {
      console.error("Gagal mengambil data dokumen:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Panggil API tiap kali page, search, atau kategori berubah
  useEffect(() => {
    fetchRegulations();
  }, [currentPage, debouncedSearch, selectedCategory]);

  const executeDelete = async () => {
    if (!itemToDelete) return;

    const id = itemToDelete.id;
    const previousData = [...data];

    // Optimistic UI: Hapus dari layar seketika
    setData(data.filter((item) => item.id !== id));
    setItemToDelete(null);

    try {
      const response = await fetch(`/api/admin/regulations/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
        credentials: 'include'
      });

      if (!response.ok) throw new Error("Gagal menghapus di server");

      // Boleh dipanggil lagi kalau mau datanya bener-bener akurat 10 baris setelah dihapus 1
      // fetchRegulations(); 
    } catch (error) {
      console.error(error);
      alert("Gagal menghapus dokumen. Server menolak.");
      setData(previousData);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleSave = async (savedItem) => {
    const dummyFileUrl = `https://orueivtvfcdgfqpkqddw.supabase.co/storage/v1/object/public/documents/${encodeURIComponent(savedItem.dokumen)}`;

    const payload = {
      title: savedItem.dokumen,
      description: savedItem.deskripsi,
      fileUrl: dummyFileUrl,
      category: savedItem.kategori
    };

    if (editingItem) {
      // --- PROSES EDIT (PATCH) ---
      try {
        const response = await fetch(`/api/admin/regulations/${editingItem.id}`, {
          method: "PATCH",
          headers: getAuthHeaders(),
          credentials: 'include',
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          fetchRegulations();
        } else {
          const errorData = await response.json();
          alert(`Gagal mengupdate dokumen: ${errorData.error || 'Server error'}`);
        }
      } catch (error) {
        console.error("Error saat update:", error);
      }
    } else {
      // --- PROSES TAMBAH BARU (POST) ---
      try {
        const response = await fetch('/api/admin/regulations', {
          method: "POST",
          headers: getAuthHeaders(),
          credentials: 'include',
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          fetchRegulations();
        } else {
          const errorData = await response.json();
          alert(`Gagal menambahkan dokumen: ${errorData.error || 'Server error'}`);
        }
      } catch (error) {
        console.error("Error saat save:", error);
      }
    }

    handleCloseModal();
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  return (
    <div className="bg-[#f2f7ff]/60 border border-blue-50 rounded-2xl p-6 shadow-sm min-h-[500px] relative flex flex-col">

      {/* HEADER: Judul + Alat Pencarian & Filter */}
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between mb-8 gap-4">
        <h2 className="text-2xl font-medium text-gray-800 shrink-0">
          Database Data Hukum
        </h2>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">

          {/* SEARCH BAR */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Cari regulasi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border border-gray-300 rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <img src="/icons/search.svg" alt="Search" className="w-4 h-4 opacity-50" />
            </div>
          </div>

          {/* FILTER KATEGORI */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:w-40 border border-gray-300 rounded-xl py-2 px-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white cursor-pointer transition"
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* TOMBOL TAMBAH */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#78b3ff] text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-blue-500 transition shadow-sm flex items-center justify-center gap-2 w-full sm:w-auto shrink-0"
          >
            <span>+</span> Tambah
          </button>
        </div>
      </div>

      {/* JUDUL KOLOM */}
      <div className="flex items-center justify-between px-4 mb-3 pb-3 border-b border-blue-50/50">
        <div className="grid grid-cols-12 gap-4 w-full">
          <p className="col-span-1 text-sm font-bold text-gray-600 text-center">No</p>
          <p className="col-span-6 text-sm font-bold text-gray-600">Dokumen</p>
          <p className="col-span-2 text-sm font-bold text-gray-600 text-center">Kategori</p>
          <p className="col-span-3 text-sm font-bold text-gray-600">Deskripsi</p>
        </div>
        <div className="w-[80px] ml-4 shrink-0"></div>
      </div>

      {/* ISI TABEL */}
      <div className="flex flex-col gap-1 flex-1">
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">Memuat data dari database...</div>
        ) : data.length === 0 ? (
          <div className="text-center py-8 text-gray-400">Belum ada dokumen / dokumen tidak ditemukan.</div>
        ) : (
          data.map((item, index) => (
            <AdminDataItem
              key={item.id}
              // Hitung nomor urut berdasarkan pagination (biar nggak reset ke 1 di tiap halaman)
              index={index + (currentPage - 1) * 10}
              item={item}
              onDelete={() => setItemToDelete(item)}
              onEdit={() => handleEdit(item)}
            />
          ))
        )}
      </div>

      {/* KONTROL PAGINATION */}
      {totalPages > 1 && !isLoading && (
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            Halaman {currentPage} dari {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Sebelumnya
            </button>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      )}

      {/* RENDER MODAL EDIT/TAMBAH */}
      {isModalOpen && (
        <AdminDataModal
          onClose={handleCloseModal}
          onSave={handleSave}
          initialData={editingItem}
        />
      )}

      {/* RENDER MODAL KONFIRMASI HAPUS */}
      {itemToDelete && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-2xl shadow-xl w-[400px] text-center transform transition-all">

            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5 border border-red-100">
              <img src="/icons/hapus.svg" alt="Warning" className="w-8 h-8 opacity-80" />
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-2">Hapus Dokumen?</h2>

            <p className="text-sm text-gray-500 mb-8 leading-relaxed">
              Apakah Anda yakin ingin menghapus dokumen <br />
              <span className="font-semibold text-gray-800">"{itemToDelete.dokumen}"</span>?<br />
              Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setItemToDelete(null)}
                className="flex-1 bg-gray-100 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-200 transition"
              >
                Batal
              </button>
              <button
                onClick={executeDelete}
                className="flex-1 bg-red-500 text-white font-semibold py-3 rounded-xl hover:bg-red-600 transition shadow-lg shadow-red-200"
              >
                Ya, Hapus
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}