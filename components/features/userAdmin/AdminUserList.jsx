import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import AdminUserItem from "./AdminUserItem";
import AdminUserModal from "./AdminUserModal";

const ITEMS_PER_PAGE = 10;

export default function AdminUserList() {
  const [data, setData] = useState([]); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState(""); 
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [tierFilter, setTierFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    setMounted(true);
    fetchUsers();
    return () => setMounted(false);
  }, []);

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
      }
    } catch (error) {
      console.error("Gagal menarik data pengguna:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const executeDelete = async () => {
    if (!userToDelete) return;
    const id = userToDelete.id;
    const previousData = [...data];
    setData(data.filter((item) => item.id !== id));
    setUserToDelete(null);
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

    const payload = {
      name: savedItem.name,
      email: savedItem.email,
      role: savedItem.role,
      tier: savedItem.tier,
      promptLimit: parseInt(savedItem.promptLimit),
    };

    if (savedItem.password) payload.password = savedItem.password;

    try {
      const url = editingItem ? `/api/admin/users/${editingItem.id}` : '/api/admin/users';
      const method = editingItem ? "PATCH" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: { 
          "Content-Type": "application/json",
          'Authorization': `Bearer ${userId}`
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        fetchUsers();
      } else {
        const err = await response.json();
        throw new Error(err.error || "Gagal memproses data");
      }
    } catch (error) {
      console.error(error);
      throw error; // Let the modal handle feedback
    }
    handleCloseModal();
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  // Advanced Filtering
  const filteredData = useMemo(() => {
    return data.filter((user) => {
      const matchesSearch = 
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.name && user.name.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesRole = roleFilter === "ALL" || user.role === roleFilter;
      const matchesTier = tierFilter === "ALL" || user.tier === tierFilter;
      
      return matchesSearch && matchesRole && matchesTier;
    });
  }, [data, searchQuery, roleFilter, tierFilter]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 min-h-[600px] flex flex-col group transition-all duration-300 hover:shadow-md relative overflow-hidden">
      
      {/* HEADER & FILTERS */}
      <div className="mb-10">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-8">
          <div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
              <div className="w-2 h-8 bg-blue-600 rounded-full" />
              Kelola Pengguna
            </h2>
            <p className="text-sm text-gray-500 mt-1 font-medium">Manajemen hak akses, limitasi, dan monitoring aktivitas user.</p>
          </div>
          
          <button 
            onClick={() => {
              setEditingItem(null);
              setIsModalOpen(true);
            }} 
            className="bg-blue-600 text-white px-8 py-4 rounded-[1.25rem] font-bold hover:bg-blue-700 transition shadow-xl shadow-blue-200 flex items-center justify-center gap-3 shrink-0 active:scale-95"
          >
            <span className="text-xl">+</span>
            <span>Tambah User</span>
          </button>
        </div>
          
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-50/50 p-4 rounded-[2rem] border border-gray-100">
          <div className="relative md:col-span-2">
            <input 
              type="text" 
              placeholder="Cari nama atau email..." 
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full bg-white border border-gray-200 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition shadow-sm"
            />
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <img src="/icons/search.svg" alt="Search" className="w-5 h-5 opacity-40" />
            </div>
          </div>

          <select 
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}
            className="bg-white border border-gray-200 rounded-2xl py-3.5 px-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none shadow-sm cursor-pointer"
          >
            <option value="ALL">Semua Role</option>
            <option value="ADMIN">Administrator</option>
            <option value="USER">Regular User</option>
          </select>

          <select 
            value={tierFilter}
            onChange={(e) => { setTierFilter(e.target.value); setCurrentPage(1); }}
            className="bg-white border border-gray-200 rounded-2xl py-3.5 px-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none shadow-sm cursor-pointer"
          >
            <option value="ALL">Semua Tier</option>
            <option value="FREE">Free Tier</option>
            <option value="PRO">Pro Member</option>
          </select>
        </div>
      </div>

      {/* PRODUCTION TABLE */}
      <div className="flex-1 overflow-x-auto custom-scrollbar -mx-8 px-8">
        <table className="w-full border-separate border-spacing-y-3">
          <thead className="sticky top-0 z-20 bg-white/80 backdrop-blur-md">
            <tr className="text-left">
              <th className="pb-4 px-6 text-[11px] font-black text-gray-400 uppercase tracking-widest">Identitas Pengguna</th>
              <th className="pb-4 px-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Role & Tier</th>
              <th className="pb-4 px-4 text-[11px] font-black text-gray-400 uppercase tracking-widest">Limit & Quota</th>
              <th className="pb-4 px-4 text-[11px] font-black text-gray-400 uppercase tracking-widest text-center">Waktu Bergabung</th>
              <th className="pb-4 px-4 text-[11px] font-black text-gray-400 uppercase tracking-widest text-center">Aktivitas Terakhir</th>
              <th className="pb-4 px-6"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="6" className="py-20 text-center">
                   <div className="flex flex-col items-center gap-4">
                      <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                      <p className="text-sm font-bold text-gray-400 animate-pulse">Menghubungkan ke database...</p>
                   </div>
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-20 text-center">
                   <div className="border-2 border-dashed border-gray-100 rounded-[2rem] p-12 inline-block">
                      <p className="text-sm font-bold text-gray-400 italic">Data pengguna tidak ditemukan.</p>
                   </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((item, index) => (
                <AdminUserItem 
                  key={item.id} 
                  index={(currentPage - 1) * ITEMS_PER_PAGE + index} 
                  item={item} 
                  onDelete={() => setUserToDelete(item)} 
                  onEdit={() => handleEdit(item)} 
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION FOOTER */}
      {!isLoading && filteredData.length > 0 && (
        <div className="mt-8 pt-8 border-t border-gray-50 flex items-center justify-between">
          <p className="text-xs font-bold text-gray-400">
            Menampilkan <span className="text-gray-900">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> - <span className="text-gray-900">{Math.min(currentPage * ITEMS_PER_PAGE, filteredData.length)}</span> dari <span className="text-gray-900">{filteredData.length}</span> Pengguna
          </p>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-2.5 rounded-xl border border-gray-100 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </button>
            
            <div className="flex items-center gap-1">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-9 h-9 rounded-xl text-xs font-black transition-all ${
                    currentPage === i + 1 
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-200" 
                      : "text-gray-400 hover:bg-gray-50"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

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
        <AdminUserModal onClose={handleCloseModal} onSave={handleSave} initialData={editingItem} />,
        document.body
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {mounted && userToDelete && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/20 backdrop-blur-md animate-fadeIn p-4">
          <div className="bg-white p-10 rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] w-full max-w-[450px] text-center transform transition-all animate-slideUp">
            <div className="w-20 h-20 bg-red-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-red-100">
              <img src="/icons/hapus.svg" alt="Hapus" className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">Hapus Pengguna?</h2>
            <p className="text-sm text-gray-500 mb-10 leading-relaxed font-medium px-4">
              Apakah Anda yakin ingin menghapus akun <br />
              <span className="font-bold text-gray-900">"{userToDelete.email}"</span>?<br />
              Seluruh riwayat obrolan akan hilang selamanya. Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setUserToDelete(null)}
                className="flex-1 bg-gray-50 text-gray-500 font-bold py-4 rounded-[1.25rem] hover:bg-gray-100 transition active:scale-95"
              >
                Batalkan
              </button>
              <button 
                onClick={executeDelete}
                className="flex-1 bg-red-500 text-white font-bold py-4 rounded-[1.25rem] hover:bg-red-600 transition shadow-xl shadow-red-200 active:scale-95"
              >
                Ya, Hapus Akun
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}