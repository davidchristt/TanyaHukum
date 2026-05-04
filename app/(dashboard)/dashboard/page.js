"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

import StatCard from "@/components/features/dashboard/StatCard";
import ActivityList from "@/components/features/dashboard/ActivityList";
import ChartPlaceholder from "@/components/features/dashboard/ChartPlaceholder";
import PopularDocs from "@/components/features/dashboard/PopularDocs";

export default function DashboardPage() {
  const [isOpen, setIsOpen] = useState(true);

  // STATE UNTUK MENYIMPAN DATA API
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // FETCH DATA DARI BACKEND
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        // GANTI URL INI KEMBALI KE API USER:
        const res = await fetch("/api/dashboard");
        const json = await res.json();

        if (json.success) {
          setDashboardData(json.data);
        }
      } catch (error) {
        console.error("Gagal mengambil data dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  return (
    <div className="page-shell page-bg">

      {/* Sidebar */}
      <div
        className={`transition-all duration-300 ${isOpen ? "w-[280px]" : "w-[80px]"}`}
      >
        <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      </div>

      {/* Main Content */}
      <div className="content-card">

          {/* Header */}
          <div className="border-b border-gray-200">
            <Header />
          </div>

          {/* Body */}
          <div className="flex-1 p-6 overflow-auto space-y-6">

            {/* Title */}
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">
                Dashboard Statistik
              </h1>
              <p className="text-sm text-gray-500">
                Selamat datang di dashboard statistik
              </p>
            </div>

            {/* Jika masih loading, tampilkan tulisan memuat */}
            {isLoading ? (
              <div className="flex items-center justify-center h-64 text-gray-500 font-medium">
                Memuat data statistik...
              </div>
            ) : (
              <>
                {/* Stat Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <StatCard
                    title="Total Regulasi"
                    value={dashboardData?.summary?.total_regulasi?.value || 0}
                    growth="Data real-time"
                  />
                  <StatCard
                    title="Pengguna Aktif"
                    value={dashboardData?.summary?.pengguna_aktif?.value || 0}
                    growth="Data real-time"
                  />
                  <StatCard
                    title="Interaksi Sehari-hari"
                    value={dashboardData?.summary?.interaksi_harian?.value || 0}
                    growth="Data real-time"
                  />
                </div>

                {/* Row: Docs + Isu */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Lempar data ke komponen anak */}
                  <PopularDocs docs={dashboardData?.dokumen_terpopuler || []} />
                  <ActivityList issues={dashboardData?.isu_terkini || []} />
                </div>

                {/* Chart Full Width */}
                <div>
                  <ChartPlaceholder trends={dashboardData?.tren_pencarian || []} />
                </div>
              </>
            )}

          </div>

      </div>
    </div>
  );
}