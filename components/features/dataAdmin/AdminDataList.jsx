"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import AdminDataItem from "./AdminDataItem";
import AdminDataModal from "./AdminDataModal";
import AdminDocDetailModal from "./AdminDocDetailModal";

const CATEGORIES = [
  "Semua",
  "Administrasi Negara",
  "Ketenagakerjaan",
  "Perdata",
  "Pidana",
  "Pemerintahan",
  "Peraturan Presiden"
];

export default function AdminDataList() {
  const [data, setData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);
  const [mounted, setMounted] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

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
        if (result.data) {
          const formattedData = result.data.map(item => ({
            id: item.id,
            dokumen: item.title,
            deskripsi: item.description,
            fileUrl: item.fileUrl,
            category: item.category || "Umum",
            createdAt: item.createdAt,
            viewCount: item.viewCount || 0,
            fileSize: item.fileSize || null,
            fileName: item.fileName || null
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

  useEffect(() => {
    fetchRegulations();
  }, [currentPage, debouncedSearch, selectedCategory]);

  const executeDelete = async () => {
    if (!itemToDelete) return;
    const id = itemToDelete.id;
    const previousData = [...data];
    setData(data.filter((item) => item.id !== id));
    setItemToDelete(null);
    try {
      const response = await fetch(`/api/admin/regulations/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
        credentials: 'include'
      });
      if (!response.ok) throw new Error("Gagal menghapus di server");
    } catch (error) {
      console.error(error);
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
      title: savedItem.title,
      description: savedItem.deskripsi,
      fileUrl: dummyFileUrl,
      category: savedItem.kategori,
      fileSize: savedItem.fileSize || null,
      fileName: savedItem.fileName || null
    };

    try {
      const url = editingItem ? `/api/admin/regulations/${editingItem.id}` : '/api/admin/regulations';
      const method = editingItem ? "PATCH" : "POST";
      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      if (response.ok) fetchRegulations();
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
    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 min-h-[600px] flex flex-col group transition-all duration-300 hover:shadow-md relative overflow-hidden">
      
      {/* HEADER SECTION */}
      <div className="mb-10">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-8">
          <div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
              <div className="w-2 h-8 bg-blue-600 rounded-full" />
              Pusat Data Hukum
            </h2>
            <p className="text-sm text-gray-500 mt-1 font-medium">Administrasi regulasi dan metadata dokumen nasional.</p>
          </div>
          
          <button 
            onClick={() => {
              setEditingItem(null);
              setIsModalOpen(true);
            }} 
            className="bg-blue-600 text-white px-8 py-4 rounded-[1.25rem] font-bold hover:bg-blue-700 transition shadow-xl shadow-blue-200 flex items-center justify-center gap-3 shrink-0 active:scale-95"
          >
            <span className="text-xl">+</span>
            <span>Tambah Dokumen</span>
          </button>
        </div>

        {/* SEARCH & FILTERS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-50/50 p-4 rounded-[2rem] border border-gray-100">
          <div className="relative md:col-span-3">
            <input 
              type="text" 
              placeholder="Cari regulasi atau metadata..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 outline-none transition shadow-sm"
            />
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <img src="/icons/search.svg" alt="Search" className="w-5 h-5 opacity-40" />
            </div>
          </div>

          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-white border border-gray-200 rounded-2xl py-3.5 px-4 text-sm font-bold focus:ring-4 focus:ring-blue-500/10 outline-none shadow-sm cursor-pointer"
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* PRODUCTION TABLE */}
      <div className="flex-1 overflow-x-auto custom-scrollbar -mx-8 px-8">
        <table className="w-full border-separate border-spacing-y-3">
          <thead className="sticky top-0 z-20 bg-white/80 backdrop-blur-md">
            <tr className="text-left">
              <th className="pb-4 px-6 text-[11px] font-black text-gray-400 uppercase tracking-widest">Informasi Dokumen</th>
              <th className="pb-4 px-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Metadata & Kategori</th>
              <th className="pb-4 px-4 text-[11px] font-black text-gray-400 uppercase tracking-widest text-center">Ukuran & Views</th>
              <th className="pb-4 px-4 text-[11px] font-black text-gray-400 uppercase tracking-widest text-center">Tgl Unggah</th>
              <th className="pb-4 px-6"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="5" className="py-20 text-center">
                   <div className="flex flex-col items-center gap-4">
                      <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                      <p className="text-sm font-bold text-gray-400 animate-pulse">Menghubungkan ke database hukum...</p>
                   </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-20 text-center">
                   <div className="border-2 border-dashed border-gray-100 rounded-[2rem] p-12 inline-block">
                      <p className="text-sm font-bold text-gray-400 italic">Dokumen tidak ditemukan dalam database.</p>
                   </div>
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <AdminDataItem 
                  key={item.id} 
                  index={index + (currentPage - 1) * 10} 
                  item={item} 
                  onDelete={() => setItemToDelete(item)} 
                  onEdit={() => handleEdit(item)}
                  onView={() => setViewingItem(item)}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION FOOTER */}
      {!isLoading && totalPages > 1 && (
        <div className="mt-8 pt-8 border-t border-gray-50 flex items-center justify-between">
          <p className="text-xs font-bold text-gray-400">
            Halaman <span className="text-gray-900 font-black">{currentPage}</span> dari <span className="text-gray-900 font-black">{totalPages}</span>
          </p>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-2.5 rounded-xl border border-gray-100 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </button>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-2.5 rounded-xl border border-gray-100 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
          </div>
        </div>
      )}

      {mounted && isModalOpen && createPortal(
        <AdminDataModal onClose={handleCloseModal} onSave={handleSave} initialData={editingItem} />,
        document.body
      )}

      {/* DOCUMENT DETAIL MODAL */}
      {mounted && viewingItem && (
        <AdminDocDetailModal
          item={viewingItem}
          onClose={() => setViewingItem(null)}
          onEdit={() => { setViewingItem(null); handleEdit(viewingItem); }}
          onDelete={() => { setViewingItem(null); setItemToDelete(viewingItem); }}
        />
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {mounted && itemToDelete && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/20 backdrop-blur-md animate-fadeIn p-4">
          <div className="bg-white p-10 rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] w-full max-w-[450px] text-center transform transition-all animate-slideUp">
            <div className="w-20 h-20 bg-red-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-red-100">
              <img src="/icons/hapus.svg" alt="Warning" className="w-10 h-10 opacity-80" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">Hapus Dokumen?</h2>
            <p className="text-sm text-gray-500 mb-10 leading-relaxed font-medium px-4">
              Apakah Anda yakin ingin menghapus dokumen <br />
              <span className="font-bold text-gray-900">"{itemToDelete.dokumen}"</span>?<br />
              Tindakan ini permanen dan tidak dapat dibatalkan.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setItemToDelete(null)}
                className="flex-1 bg-gray-50 text-gray-400 font-bold py-4 rounded-[1.25rem] hover:bg-gray-100 transition active:scale-95 text-xs uppercase tracking-widest"
              >
                Batalkan
              </button>
              <button
                onClick={executeDelete}
                className="flex-1 bg-red-500 text-white font-bold py-4 rounded-[1.25rem] hover:bg-red-600 transition shadow-xl shadow-red-200 active:scale-95 text-xs uppercase tracking-widest"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}