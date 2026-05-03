"use client";

import { useState, useEffect } from "react";
import AdminDataItem from "./AdminDataItem";
import AdminDataModal from "./AdminDataModal";

export default function AdminDataList() {
  const [data, setData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [itemToDelete, setItemToDelete] = useState(null);

  // <-- TAMBAHAN 1: State untuk Search dan Kategori
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");

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
      const response = await fetch('/api/admin/regulations', {
        headers: getAuthHeaders(),
        credentials: 'include'
      });
      
      if (response.ok) {
        const result = await response.json();
        const formattedData = result.map(item => ({
          id: item.id,
          dokumen: item.title,
          deskripsi: item.description,
          fileUrl: item.fileUrl,
          category: item.category || "Umum" // <-- TAMBAHAN 2: Tangkap data kategori dari database
        }));
        setData(formattedData);
      }
    } catch (error) {
      console.error("Gagal mengambil data dokumen:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRegulations();
  }, []);

  // Fungsi ini baru akan jalan kalau user klik "Ya, Hapus" di pop-up
  const executeDelete = async () => {
    if (!itemToDelete) return;
    
    const id = itemToDelete.id;
    const previousData = [...data];
    
    // Hapus dari layar seketika biar terasa ngebut (Optimistic UI)
    setData(data.filter((item) => item.id !== id));
    setItemToDelete(null); // Langsung tutup pop-up konfirmasi

    try {
      const response = await fetch(`/api/admin/regulations/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error("Gagal menghapus di server");
    } catch (error) {
      console.error(error);
      alert("Gagal menghapus dokumen. Server menolak.");
      setData(previousData); // Kembalikan datanya ke layar kalau gagal
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
      category: savedItem.kategori // <-- PERBAIKAN: Ambil kategori asli dari modal!
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
          fetchRegulations(); // Tarik ulang data terbaru jika berhasil edit
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
          fetchRegulations(); // Tarik ulang data terbaru jika berhasil tambah
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

  // <-- TAMBAHAN 3: Ambil daftar kategori unik dari data secara dinamis
  const uniqueCategories = ["Semua", ...new Set(data.map(item => item.category))];

  // <-- TAMBAHAN 4: Logika untuk menyaring (Filter & Search) data
  const filteredData = data.filter((item) => {
    const matchSearch = item.dokumen.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = selectedCategory === "Semua" || item.category === selectedCategory;
    return matchSearch && matchCategory;
  });

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
            {uniqueCategories.map(cat => (
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
          <div className="text-center py-8 text-gray-400">Belum ada dokumen hukum. Silakan tambah data.</div>
        ) : filteredData.length === 0 ? (
          <div className="text-center py-8 text-gray-400">Dokumen yang dicari tidak ditemukan.</div>
        ) : (
          filteredData.map((item, index) => (
            <AdminDataItem 
              key={item.id} 
              index={index} 
              item={item} 
              onDelete={() => setItemToDelete(item)}
              onEdit={() => handleEdit(item)} 
            />
          ))
        )}
      </div>

      {/* RENDER MODAL */}
      {isModalOpen && (
        <AdminDataModal 
          onClose={handleCloseModal} 
          onSave={handleSave} 
          initialData={editingItem} 
        />
      )}

      {/* RENDER MODAL EDIT/TAMBAH */}
      {isModalOpen && (
        <AdminDataModal 
          onClose={handleCloseModal} 
          onSave={handleSave} 
          initialData={editingItem} 
        />
      )}

      {/* RENDER MODAL KONFIRMASI HAPUS (TAMBAHAN BARU) */}
      {itemToDelete && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-2xl shadow-xl w-[400px] text-center transform transition-all">
            
            {/* Ikon Peringatan */}
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