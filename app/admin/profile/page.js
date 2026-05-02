"use client";

import { useState } from "react";

// 1. Layout Admin
import AdminSidebar from "@/components/layout/AdminSidebar";
import AdminHeader from "@/components/layout/AdminHeader";

// 2. Komponen Profile Admin
import AdminProfileCard from "@/components/features/profileAdmin/AdminProfileCard";
import AdminProfileForm from "@/components/features/profileAdmin/AdminProfileForm";

export default function AdminProfilePage() {
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

        {/* Wadah Glassmorphism */}
        <div className="h-full bg-white/70 backdrop-blur-md rounded-2xl shadow-lg flex flex-col">

          {/* HEADER */}
          <div className="border-b border-gray-200">
            <AdminHeader />
          </div>

          {/* CONTENT TENGAH */}
          <div className="flex-1 flex items-center justify-center px-6 py-6 overflow-auto">

            {/* Container khusus membatasi lebar form biar rapi */}
            <div className="w-full max-w-xl space-y-4">
              <AdminProfileCard />
              <AdminProfileForm />
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}