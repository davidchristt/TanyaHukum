"use client";

import { useState } from "react";
import AdminDataItem from "./AdminDataItem";
import AdminDataModal from "./AdminDataModal";

const initialData = [
  { id: 1, dokumen: "Undang-Undang Nomor 1 Tahun 2025", deskripsi: "Perubahan mengenai UU ITE 2021" },
  { id: 2, dokumen: "Undang-Undang Nomor 1 Tahun 2025", deskripsi: "Perubahan mengenai UU ITE 2021" },
  { id: 3, dokumen: "Undang-Undang Nomor 1 Tahun 2025", deskripsi: "Perubahan mengenai UU ITE 2021" },
];

export default function AdminDataList() {
  const [data, setData] = useState(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null); // State untuk menampung item yang sedang diedit

  const handleDelete = (id) => {
    setData(data.filter((item) => item.id !== id));
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleSave = (savedItem) => {
    if (editingItem) {
      // Logic UPDATE data lama
      setData(data.map((item) => 
        item.id === editingItem.id ? { ...item, ...savedItem } : item
      ));
    } else {
      // Logic TAMBAH data baru
      const newItem = { ...savedItem, id: Date.now() };
      setData([...data, newItem]);
    }
    handleCloseModal();
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null); // Reset agar mode kembali ke "Tambah"
  };

  return (
    <div className="bg-[#f2f7ff]/60 border border-blue-50 rounded-2xl p-6 shadow-sm min-h-[500px] relative">
      
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
      <div className="flex flex-col gap-1">
        {data.map((item, index) => (
          <AdminDataItem 
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
        <AdminDataModal 
          onClose={handleCloseModal} 
          onSave={handleSave} 
          initialData={editingItem} 
        />
      )}

    </div>
  );
}