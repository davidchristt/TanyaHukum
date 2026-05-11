"use client";

import { useState } from "react";

// 1. Layout
import AdminSidebar from "@/components/layout/AdminSidebar";
import AdminHeader from "@/components/layout/AdminHeader";

// 2. Fitur Khusus Halaman Manage User
import AdminUserList from "@/components/features/userAdmin/AdminUserList";

export default function ManageUserPage() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="h-screen bg-[#eaf1fb] p-6 flex gap-4">

      {/* ===== SIDEBAR ===== */}
      <div
        className={`transition-all duration-300 ${
          isOpen ? "w-[280px]" : "w-[80px]"
        }`}
      >
        <AdminSidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <div className="flex-1">

        <div className="h-full bg-white/70 backdrop-blur-md rounded-2xl shadow-lg flex flex-col">

          {/* HEADER */}
          <div className="border-b border-gray-200">
            <AdminHeader />
          </div>

          {/* BODY (Konten Tabel User) */}
          <div className="flex-1 p-8 overflow-auto">
             <AdminUserList />
          </div>

        </div>

      </div>
    </div>
  );
}