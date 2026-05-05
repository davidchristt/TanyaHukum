"use client";

import { useState, useEffect } from "react";
import AdminUserItem from "./AdminUserItem";
import AdminUserModal from "./AdminUserModal";

export default function AdminUserList() {
  const [data, setData] = useState([]); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState(""); 
  
  // <-- TAMBAHAN 1: State untuk menyimpan data user yang mau dihapus (untuk pop-up)
  const [userToDelete, setUserToDelete] = useState(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const userDataString = localStorage.getItem("user");
      let userId = "";
      let userRole = "";
      
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        userId = userData.id || "";
        userRole = userData.role || "";
      }

      const response = await fetch('/api/admin/users', { 
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userId}`, 
          'x-user-id': userId,                 
          'x-user-role': userRole              
        },
        credentials: 'include'                 
      }); 

      if (response.ok) {
        const result = await response.json();
        setData(result || []); 
      } else {
        const errorText = await response.text();
        console.error(`Gagal karena status: ${response.status}. Pesan: ${errorText}`);
      }
    } catch (error) {
      console.error("Gagal menarik data pengguna:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // <-- PERUBAHAN 2: Fungsi hapus dipindah ke sini dan dipanggil DARI POP-UP
  const executeDelete = async () => {
    if (!userToDelete) return;

    const id = userToDelete.id;
    const previousData = [...data];
    
    setData(data.filter((item) => item.id !== id));
    setUserToDelete(null); // Tutup pop-up
    
    try {
      const userDataString = localStorage.getItem("user");
      const userId = userDataString ? JSON.parse(userDataString).id : "";

      const response = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
        headers: { 'Authorization': `Bearer ${userId}` }
      });
      if (!response.ok) throw new Error("Gagal menghapus data di server");
    } catch (error) {
      console.error(error);
      alert("Gagal menghapus user. Silakan coba lagi.");
      setData(previousData);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleSave = async (savedItem) => {
    const userDataString = localStorage.getItem("user");
    const userId = userDataString ? JSON.parse(userDataString).id : "";

    if (editingItem) {
      try {
        const updatePayload = {
          name: savedItem.nama, 
          email: savedItem.email,
          role: savedItem.role === 1 ? "ADMIN" : "USER"
        };
        
        if (savedItem.password) {
          updatePayload.password = savedItem.password;
        }

        const response = await fetch(`/api/admin/users/${editingItem.id}`, {
          method: "PATCH",
          headers: { 
            "Content-Type": "application/json",
            'Authorization': `Bearer ${userId}`
          },
          body: JSON.stringify(updatePayload),
        });
        
        if (response.ok) {
          const updatedUser = await response.json();
          setData(data.map((item) => item.id === editingItem.id ? updatedUser : item));
        } else {
          alert("Gagal mengupdate user.");
        }
      } catch (error) {
        console.error(error);
      }
    } else {
      try {
        const response = await fetch('/api/admin/users', {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            'Authorization': `Bearer ${userId}`
          },
          body: JSON.stringify({
            name: savedItem.nama, 
            email: savedItem.email,
            password: savedItem.password, 
            role: savedItem.role === 1 ? "ADMIN" : "USER"
          }),
        });
        
        if (response.ok) {
          const newUser = await response.json();
          setData([newUser, ...data]);
        } else {
          alert("Gagal menambahkan user baru.");
        }
      } catch (error) {
        console.error(error);
      }
    }
    handleCloseModal();
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const filteredData = data.filter((item) => 
    item.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-[#f2f7ff]/60 border border-blue-50 rounded-2xl p-6 shadow-sm min-h-[500px] relative">
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <h2 className="text-2xl font-medium text-gray-800">User List</h2>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <input 
              type="text" 
              placeholder="Cari email pengguna..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border border-gray-300 rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <img src="/icons/search.svg" alt="Search" className="w-4 h-4 opacity-50" />
            </div>
          </div>

          <button 
            onClick={() => {
              setEditingItem(null);
              setIsModalOpen(true);
            }} 
            className="bg-[#78b3ff] text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-blue-500 transition shadow-sm flex items-center gap-2 shrink-0"
          >
            <span>+</span> Tambah
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 w-full px-4 mb-4">
        <p className="col-span-1 text-sm font-bold text-gray-800 text-center">No</p>
        <p className="col-span-3 text-sm font-bold text-gray-800">Email Utama</p>
        <p className="col-span-5 text-sm font-bold text-gray-800">Status Tier</p>
        <p className="col-span-1 text-sm font-bold text-gray-800 text-center">Role</p>
        <p className="col-span-2"></p> 
      </div>
      
      <div className="flex flex-col gap-1">
        {isLoading ? (
          <p className="text-center text-gray-500 py-4">Memuat data pengguna...</p>
        ) : data.length === 0 ? (
          <p className="text-center text-gray-500 py-4">Belum ada pengguna terdaftar.</p>
        ) : filteredData.length === 0 ? (
          <p className="text-center text-gray-500 py-4">Pengguna dengan email "{searchQuery}" tidak ditemukan.</p>
        ) : (
          filteredData.map((item, index) => (
            <AdminUserItem 
              key={item.id} 
              index={index} 
              item={item} 
              // <-- PERUBAHAN 3: Buka pop-up saat tombol hapus diklik
              onDelete={() => setUserToDelete(item)} 
              onEdit={() => handleEdit(item)} 
            />
          ))
        )}
      </div>
      
      {isModalOpen && <AdminUserModal onClose={handleCloseModal} onSave={handleSave} initialData={editingItem} />}

      {/* <-- TAMBAHAN 4: RENDER MODAL KONFIRMASI HAPUS --> */}
      {userToDelete && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-2xl shadow-xl w-[400px] text-center transform transition-all">
            
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-5 border border-blue-100">
              <img src="/icons/hapus.svg" alt="Hapus" className="w-8 h-8" />
            </div>
            
            <h2 className="text-xl font-bold text-gray-900 mb-2">Hapus Pengguna?</h2>
            
            <p className="text-sm text-gray-500 mb-8 leading-relaxed">
              Apakah Anda yakin ingin menghapus akun <br />
              <span className="font-semibold text-gray-800">"{userToDelete.email}"</span>?<br />
              Seluruh riwayat obrolan dan data pengguna ini akan terhapus secara permanen.
            </p>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setUserToDelete(null)}
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