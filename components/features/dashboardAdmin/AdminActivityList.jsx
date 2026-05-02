"use client";

import { useState } from "react";
import AdminActivityItem from "./AdminActivityItem";
import AdminIssueModal from "./AdminIssueModal";

const initialData = [
  {
    id: 1,
    title: "Maling Helm di unpad",
    desc: "Pelaku kabur ke Pangdam",
    time: "2 J Lalu",
  },
  {
    id: 2,
    title: "Aksi demo gedung sate",
    desc: "Demo berlangsung siang hari",
    time: "11 J Lalu",
  },
];

export default function AdminActivityList() {
  // ===== SEMUA STATE DAN FUNGSI HARUS ADA DI DALAM SINI =====
  const [data, setData] = useState(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDelete = (id) => {
    setData(data.filter((item) => item.id !== id));
  };

  const handleAdd = (newIssue) => {
    const issueWithId = { ...newIssue, id: Date.now() }; // Beri ID unik dummy
    setData([issueWithId, ...data]); // Masukkan ke urutan paling atas
    setIsModalOpen(false); // Tutup modal
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Isu Terkini 🔥
        </h3>
        
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-8 h-8 flex items-center justify-center bg-blue-50 text-blue-600 rounded-md border border-blue-200 hover:bg-blue-100 transition"
        >
          +
        </button>
      </div>

      <div className="space-y-3">
        {data.map((item) => (
          <AdminActivityItem
            key={item.id}
            item={item}
            onDelete={() => handleDelete(item.id)}
          />
        ))}
      </div>

      {/* Panggil Modal di dalam return UI */}
      {isModalOpen && (
        <AdminIssueModal 
          onClose={() => setIsModalOpen(false)} 
          onSave={handleAdd} 
        />
      )}

    </div>
  );
}