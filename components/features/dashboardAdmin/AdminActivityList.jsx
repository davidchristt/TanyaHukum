"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import AdminActivityItem from "./AdminActivityItem";
import AdminIssueModal from "./AdminIssueModal";
import AdminIssueDetailModal from "./AdminIssueDetailModal";

export default function AdminActivityList() {
  const [data, setData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [issueToDelete, setIssueToDelete] = useState(null);
  const [viewingIssue, setViewingIssue] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchIssues();
    return () => setMounted(false);
  }, []);

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

  const fetchIssues = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/trending', {
        headers: getAuthHeaders(),
        credentials: 'include'
      });
      
      if (response.ok) {
        const result = await response.json();
        const formattedData = result.map(item => {
          const date = new Date(item.publishDate || item.createdAt);
          const now = new Date();
          const diffMs = now - date;
          const diffMins = Math.floor(diffMs / (1000 * 60));
          const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
          const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
          let timeStr = "Baru saja";
          if (diffDays > 0) timeStr = `${diffDays}h lalu`;
          else if (diffHours > 0) timeStr = `${diffHours}j lalu`;
          else if (diffMins > 0) timeStr = `${diffMins}m lalu`;

          return {
            id: item.id,
            title: item.title,
            desc: item.description,
            location: item.location,
            link: item.newsLink,
            isActive: item.isActive,
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

  const executeDelete = async () => {
    if (!issueToDelete) return;
    const id = issueToDelete.id;
    const previousData = [...data];
    setData(data.filter((item) => item.id !== id));
    setIssueToDelete(null);
    try {
      const response = await fetch(`/api/admin/trending/${id}`, {
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

  const handleAdd = async (newIssue) => {
    try {
      const response = await fetch('/api/admin/trending', {
        method: "POST",
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({
          title: newIssue.title,
          description: newIssue.desc,
          newsLink: newIssue.link,
          location: newIssue.location,
        })
      });
      if (response.ok) {
        fetchIssues();
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error("Gagal tambah isu:", error);
    }
  };

  return (
    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 h-full flex flex-col transition-all duration-300 hover:shadow-md relative">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-5 bg-blue-600 rounded-full" />
          <h3 className="text-sm font-black text-gray-900">Isu Terkini</h3>
          <span className="text-[8px] font-black text-gray-400 bg-gray-50 px-2 py-0.5 rounded border border-gray-100 uppercase">{data.length}</span>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-8 h-8 flex items-center justify-center bg-blue-50 text-blue-600 rounded-xl border border-blue-100 hover:bg-blue-100 transition shadow-sm active:scale-90"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        </button>
      </div>

      <div className="space-y-3 overflow-y-auto custom-scrollbar pr-1 flex-1">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <div className="w-8 h-8 border-3 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
            <p className="text-[10px] font-bold text-gray-400 animate-pulse uppercase tracking-widest">Memuat isu...</p>
          </div>
        ) : data.length > 0 ? (
          data.map((item) => (
            <AdminActivityItem key={item.id} item={item} onDelete={() => setIssueToDelete(item)} onView={() => setViewingIssue(item)} />
          ))
        ) : (
          <div className="flex items-center justify-center h-full py-8">
            <p className="text-[10px] font-bold text-gray-400 italic">Belum ada isu terkini.</p>
          </div>
        )}
      </div>

      {/* PORTAL: ADD ISSUE MODAL */}
      {mounted && isModalOpen && createPortal(
        <AdminIssueModal onClose={() => setIsModalOpen(false)} onSave={handleAdd} />,
        document.body
      )}

      {/* PORTAL: ISSUE DETAIL MODAL */}
      {mounted && viewingIssue && (
        <AdminIssueDetailModal
          item={viewingIssue}
          onClose={() => setViewingIssue(null)}
          onDelete={() => { setViewingIssue(null); setIssueToDelete(viewingIssue); }}
        />
      )}

      {/* PORTAL: DELETE CONFIRMATION */}
      {mounted && issueToDelete && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/20 backdrop-blur-md animate-fadeIn p-4">
          <div className="bg-white p-10 rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] w-full max-w-[450px] text-center transform transition-all animate-slideUp">
            <div className="w-20 h-20 bg-red-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-red-100">
              <img src="/icons/hapus.svg" alt="Hapus" className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">Hapus Isu Terkini?</h2>
            <p className="text-sm text-gray-500 mb-10 leading-relaxed font-medium px-4">
              Apakah Anda yakin ingin menghapus <br />
              <span className="font-bold text-gray-900">"{issueToDelete.title}"</span>?<br />
              Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-4">
              <button onClick={() => setIssueToDelete(null)} className="flex-1 bg-gray-50 text-gray-400 font-bold py-4 rounded-[1.25rem] hover:bg-gray-100 transition active:scale-95 text-xs uppercase tracking-widest">
                Batalkan
              </button>
              <button onClick={executeDelete} className="flex-1 bg-red-500 text-white font-bold py-4 rounded-[1.25rem] hover:bg-red-600 transition shadow-xl shadow-red-200 active:scale-95 text-xs uppercase tracking-widest">
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