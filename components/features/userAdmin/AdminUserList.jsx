"use client";

import { useState } from "react";
import AdminUserItem from "./AdminUserItem";
import AdminUserModal from "./AdminUserModal";

// Data dummy disesuaikan persis dengan gambar referensimu
const initialData = [
  { id: 1, nama: "Dzacky Ahmad", email: "dzacky001@mail.unpad.ac.id", role: 1 },
  { id: 2, nama: "Azmi Naifah iftinah", email: "azmilala@gmail.com", role: 1 },
  { id: 3, nama: "David", email: "david@gmail.com", role: 0 },
];

export default function AdminUserList() {
  const [data, setData] = useState(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const handleDelete = (id) => {
    setData(data.filter((item) => item.id !== id));
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleSave = (savedItem) => {
    if (editingItem) {
      // UPDATE data lama
      setData(data.map((item) => 
        item.id === editingItem.id ? { ...item, ...savedItem } : item
      ));
    } else {
      // TAMBAH data baru
      const newItem = { ...savedItem, id: Date.now() };
      setData([...data, newItem]);
    }
    handleCloseModal();
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  return (
    <div className="bg-[#f2f7ff]/60 border border-blue-50 rounded-2xl p-6 shadow-sm min-h-[500px] relative">
      
      {/* HEADER TABEL */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-medium text-gray-800">
          User List
        </h2>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[#78b3ff] text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-blue-500 transition shadow-sm flex items-center gap-2"
        >
          <span>+</span> Tambah
        </button>
      </div>

      {/* JUDUL KOLOM (Grid harus sama dengan Item) */}
      <div className="grid grid-cols-12 gap-4 w-full px-4 mb-4">
        <p className="col-span-1 text-sm font-bold text-gray-800 text-center">No</p>
        <p className="col-span-3 text-sm font-bold text-gray-800">Nama</p>
        <p className="col-span-5 text-sm font-bold text-gray-800">Email</p>
        <p className="col-span-1 text-sm font-bold text-gray-800 text-center">Role</p>
        <p className="col-span-2"></p> {/* Kosong untuk area tombol */}
      </div>

      {/* ISI TABEL */}
      <div className="flex flex-col gap-1">
        {data.map((item, index) => (
          <AdminUserItem 
            key={item.id} 
            index={index} 
            item={item} 
            onDelete={() => handleDelete(item.id)}
            onEdit={() => handleEdit(item)} 
          />
        ))}
      </div>

      {/* RENDER MODAL */}
      {isModalOpen && (
        <AdminUserModal 
          onClose={handleCloseModal} 
          onSave={handleSave} 
          initialData={editingItem} 
        />
      )}

    </div>
  );
}