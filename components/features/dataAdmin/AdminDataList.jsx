"use client";

import { useState, useEffect } from "react";
import AdminDataItem from "./AdminDataItem";
import AdminDataModal from "./AdminDataModal";

export default function AdminDataList() {
  const [data, setData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fungsi untuk menyertakan token JWT agar lolos satpam Middleware
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

  // 1. GET: Ambil data dokumen asli dari database
  const fetchRegulations = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/regulations', {
        headers: getAuthHeaders(),
        credentials: 'include'
      });
      
      if (response.ok) {
        const result = await response.json();
        // Sesuaikan nama variabel database dengan props yang dibutuhkan UI
        const formattedData = result.map(item => ({
          id: item.id,
          dokumen: item.title,       // UI pakai 'dokumen', API pakai 'title'
          deskripsi: item.description, // UI pakai 'deskripsi', API pakai 'description'
          fileUrl: item.fileUrl
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

  // 2. DELETE: Hapus dokumen dari database
  const handleDelete = async (id) => {
    const previousData = [...data];
    setData(data.filter((item) => item.id !== id));
    
    try {
      const response = await fetch(`/api/admin/regulations/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error("Gagal menghapus di server");
    } catch (error) {
      console.error(error);
      alert("Gagal menghapus dokumen. Satpam API menolak.");
      setData(previousData); 
    }
  };

  // 3. POST / PATCH: Simpan dokumen baru ke database
  const handleSave = async (savedItem) => {
    // Simulasi URL Supabase karena belum ada API Upload Storage
    const dummyFileUrl = `https://orueivtvfcdgfqpkqddw.supabase.co/storage/v1/object/public/documents/${encodeURIComponent(savedItem.dokumen)}`;

    const payload = {
      title: savedItem.dokumen,
      description: savedItem.deskripsi,
      fileUrl: dummyFileUrl, 
      category: "Umum" // Default category
    };

    if (editingItem) {
      // CATATAN: Backend belum punya route PATCH di /api/admin/regulations/[id]
      // Jadi untuk saat ini, kita beri alert edukasi. Nanti tinggal tagih backend buat bikin API-nya.
      alert("Fitur Edit belum didukung oleh Backend. Silakan tambah dokumen baru.");
      handleCloseModal();
      return;
    } 

    try {
      // Proses POST (Tambah Data)
      const response = await fetch('/api/admin/regulations', {
        method: "POST",
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        fetchRegulations(); // Tarik ulang data terbaru jika berhasil
      } else {
        const errorData = await response.json();
        alert(`Gagal menambahkan dokumen: ${errorData.error || 'Server error'}`);
      }
    } catch (error) {
      console.error("Error saat save:", error);
    }
    
    handleCloseModal();
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null); 
  };

  return (
    <div className="bg-[#f2f7ff]/60 border border-blue-50 rounded-2xl p-6 shadow-sm min-h-[500px] relative flex flex-col">
      
      {/* HEADER TABEL */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-medium text-gray-800">
          Database Data Hukum
        </h2>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[#78b3ff] text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-blue-500 transition shadow-sm flex items-center gap-2"
        >
          <span>+</span> Tambah
        </button>
      </div>

      {/* JUDUL KOLOM */}
      <div className="grid grid-cols-12 gap-4 w-full px-4 mb-4">
        <p className="col-span-1 text-sm font-medium text-gray-600 text-center">No</p>
        <p className="col-span-5 text-sm font-medium text-gray-600">Dokumen</p>
        <p className="col-span-6 text-sm font-medium text-gray-600">Deskripsi</p>
      </div>

      {/* ISI TABEL */}
      <div className="flex flex-col gap-1 flex-1">
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">Memuat data dari database...</div>
        ) : data.length === 0 ? (
          <div className="text-center py-8 text-gray-400">Belum ada dokumen hukum. Silakan tambah data.</div>
        ) : (
          data.map((item, index) => (
            <AdminDataItem 
              key={item.id} 
              index={index} 
              item={item} 
              onDelete={() => handleDelete(item.id)}
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

    </div>
  );
}