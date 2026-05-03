"use client";

import { useState, useEffect } from "react";
import AdminActivityItem from "./AdminActivityItem";
import AdminIssueModal from "./AdminIssueModal";

export default function AdminActivityList() {
  const [data, setData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fungsi praktis untuk membuat ID Card (Header + Token)
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

  // 1. GET: Minta daftar isu ke database saat komponen muncul
  const fetchIssues = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/trending', {
        headers: getAuthHeaders(),
        credentials: 'include'
      });
      
      if (response.ok) {
        const result = await response.json();
        
        // Format tanggal dari database biar enak dibaca
        const formattedData = result.map(item => {
          const date = new Date(item.publishDate || item.createdAt);
          const now = new Date();
          const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
          let timeStr = diffInHours < 1 ? "Baru saja" : `${diffInHours} Jam Lalu`;

          return {
            id: item.id,
            title: item.title,
            desc: item.description, // Menyesuaikan nama dari database (description -> desc)
            time: timeStr
          };
        });
        
        setData(formattedData);
      }
    } catch (error) {
      console.error("Gagal mengambil data isu:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Jalankan fetch otomatis saat halaman dibuka
  useEffect(() => {
    fetchIssues();
  }, []);

  // 2. DELETE: Hapus isu secara permanen
  const handleDelete = async (id) => {
    // Trik UI: Hapus dari layar dulu biar kerasa cepat (Optimistic UI)
    const previousData = [...data];
    setData(data.filter((item) => item.id !== id));
    
    try {
      const response = await fetch(`/api/admin/trending/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error("Gagal menghapus di server");
    } catch (error) {
      console.error(error);
      alert("Gagal menghapus isu terkini. Satpam API menolak.");
      setData(previousData); // Kalau server nolak, balikin lagi datanya ke layar
    }
  };

  // 3. POST: Simpan isu baru ke database
  const handleAdd = async (newIssue) => {
    try {
      const response = await fetch('/api/admin/trending', {
        method: "POST",
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({
          title: newIssue.title,
          description: newIssue.desc, // Frontend pakai 'desc', backend pakai 'description'
          newsLink: newIssue.link     // Frontend pakai 'link', backend pakai 'newsLink'
        })
      });

      if (response.ok) {
        // Kalau berhasil disimpan, tarik ulang data terbaru dari database
        fetchIssues();
        setIsModalOpen(false);
      } else {
        alert("Gagal menambahkan isu terkini.");
      }
    } catch (error) {
      console.error("Gagal tambah isu:", error);
    }
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Isu Terkini
        </h3>
        
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-8 h-8 flex items-center justify-center bg-blue-50 text-blue-600 rounded-md border border-blue-200 hover:bg-blue-100 transition"
        >
          +
        </button>
      </div>

      <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2 flex-1">
        {isLoading ? (
          <div className="text-center py-4 text-gray-400 text-sm">Memuat data asli dari database...</div>
        ) : data.length > 0 ? (
          data.map((item) => (
            <AdminActivityItem
              key={item.id}
              item={item}
              onDelete={() => handleDelete(item.id)}
            />
          ))
        ) : (
          <div className="text-center py-4 text-gray-400 text-sm flex items-center justify-center h-full">Belum ada isu terkini. Silakan tambah.</div>
        )}
      </div>

      {isModalOpen && (
        <AdminIssueModal 
          onClose={() => setIsModalOpen(false)} 
          onSave={handleAdd} 
        />
      )}
    </div>
  );
}