"use client";

import { useState } from "react";

// 1. Layout
import AdminSidebar from "@/components/layout/AdminSidebar";
import AdminHeader from "@/components/layout/AdminHeader";

// 2. Features (Reuse dari User)
import StatCard from "@/components/features/dashboard/StatCard";
import PopularDocs from "@/components/features/dashboard/PopularDocs";
import ChartPlaceholder from "@/components/features/dashboard/ChartPlaceholder";

// 3. Features (Admin Specific)
import AdminActivityList from "@/components/features/dashboardAdmin/AdminActivityList";

export default function AdminDashboardPage() {
  const [isOpen, setIsOpen] = useState(true);
  
  // State untuk menyimpan nama pengguna. 
  // Nanti bisa diganti dengan data dari database/localStorage saat fitur login sudah ada.
  const [adminName, setAdminName] = useState("Admin"); 

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

          {/* BODY */}
          <div className="flex-1 p-6 overflow-auto space-y-6">

            {/* TITLE */}
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">
                Dashboard Statistik
              </h1>
              <p className="text-sm text-gray-500">
                Halo, {adminName}! Selamat Datang di Dashboard Statistik
              </p>
            </div>

            {/* STAT CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard title="Total Regulasi" value="100" growth="+12%" />
              <StatCard title="Pengguna Aktif" value="1025" growth="+5%" />
              <StatCard title="Interaksi Sehari-hari" value="950" growth="+10%" />
            </div>

            {/* ROW: DOCS + ISU */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PopularDocs />
              <AdminActivityList />
            </div>

            {/* CHART FULL WIDTH */}
            <div>
              <ChartPlaceholder />
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}