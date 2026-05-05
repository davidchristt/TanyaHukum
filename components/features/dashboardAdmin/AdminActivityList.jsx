"use client";

import { useState, useEffect } from "react";
import AdminActivityItem from "./AdminActivityItem";
import AdminIssueModal from "./AdminIssueModal";

export default function AdminActivityList() {
  const [data, setData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // <-- TAMBAHAN: State untuk pop-up konfirmasi hapus
  const [issueToDelete, setIssueToDelete] = useState(null);

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
            desc: item.description,
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

  // 2. DELETE: Eksekusi hapus yang dipanggil DARI POP-UP
  const executeDelete = async () => {
    if (!issueToDelete) return;

    const id = issueToDelete.id;
    const previousData = [...data];
    
    // Trik UI: Hapus dari layar dulu biar kerasa cepat (Optimistic UI)
    setData(data.filter((item) => item.id !== id));
    setIssueToDelete(null); // Langsung tutup pop-up konfirmasi
    
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
          description: newIssue.desc, 
          newsLink: newIssue.link     
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
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 h-full flex flex-col relative">
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
              // <-- PERUBAHAN: Buka pop-up dan kirim data isu, JANGAN langsung hapus
              onDelete={() => setIssueToDelete(item)} 
            />
          ))
        ) : (
          <div className="text-center py-4 text-gray-400 text-sm flex items-center justify-center h-full">Belum ada isu terkini. Silakan tambah.</div>
        )}
      </div>

      {/* RENDER MODAL TAMBAH ISU */}
      {isModalOpen && (
        <AdminIssueModal 
          onClose={() => setIsModalOpen(false)} 
          onSave={handleAdd} 
        />
      )}

      {/* RENDER MODAL KONFIRMASI HAPUS (TAMBAHAN BARU) */}
      {issueToDelete && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-2xl shadow-xl w-[400px] text-center transform transition-all">
            
            {/* Ikon Peringatan (SEKARANG PAKAI IKON BIRU ASLI BOS!) */}
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-5 border border-blue-100">
              <img src="/icons/hapus.svg" alt="Hapus" className="w-8 h-8" />
            </div>
            
            <h2 className="text-xl font-bold text-gray-900 mb-2">Hapus Isu Terkini?</h2>
            
            <p className="text-sm text-gray-500 mb-8 leading-relaxed">
              Apakah Anda yakin ingin menghapus <br />
              <span className="font-semibold text-gray-800">"{issueToDelete.title}"</span>?<br />
              Tindakan ini tidak dapat dibatalkan.
            </p>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setIssueToDelete(null)}
                className="flex-1 bg-gray-100 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-200 transition"
              >
                Batal
              </button>
              {/* Tombol eksekusi tetap merah sebagai standar keamanan UX untuk peringatan "Hapus" */}
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