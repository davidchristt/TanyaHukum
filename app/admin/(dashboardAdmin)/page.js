"use client";

import { useState, useEffect } from "react";

// 1. Layout
import AdminSidebar from "@/components/layout/AdminSidebar";
import AdminHeader from "@/components/layout/AdminHeader";
import StatCard from "@/components/features/dashboard/StatCard";

// 2. Features (Admin Specific yang baru dibuat)
import AdminPopularDocs from "@/components/features/dashboardAdmin/AdminPopularDocs";
import AdminActivityList from "@/components/features/dashboardAdmin/AdminActivityList";
import AdminChart from "@/components/features/dashboardAdmin/AdminChart";

export default function AdminDashboardPage() {
  const [isOpen, setIsOpen] = useState(true);
  const [adminName, setAdminName] = useState("Admin");
  const [isLoading, setIsLoading] = useState(true);
  
  const [dashboardData, setDashboardData] = useState({
    stats: { totalRegulations: 0, activeUsers: 0, dailyInteractions: 0 },
    isuTerkini: [],
    dokumenTerpopuler: [],
    trenPencarian: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Ambil data user dari localStorage (buat jaga-jaga kalau backend minta token di header)
        const userDataString = localStorage.getItem("user");
        let userId = "";
        if (userDataString) {
          const userData = JSON.parse(userDataString);
          userId = userData.id || "";
          if (userData.nama) setAdminName(userData.nama); // Sekalian update nama admin di layar!
        }

        // PERBAIKAN: Tambahkan credentials dan header agar satpam middleware mengizinkan masuk
        const response = await fetch('/api/admin/dashboard/stats', { 
          cache: 'no-store',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userId}`
          },
          credentials: 'include' // <-- INI KUNCINYA! Agar cookies token dikirim ke middleware
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setDashboardData({
              stats: {
                totalRegulations: result.data.summary.total_regulasi.value,
                activeUsers: result.data.summary.pengguna_aktif.value,
                dailyInteractions: result.data.summary.interaksi_harian.value
              },
              isuTerkini: result.data.isu_terkini,
              dokumenTerpopuler: result.data.dokumen_terpopuler,
              trenPencarian: result.data.tren_pencarian
            });
          }
        } else {
          console.error("Akses ditolak satpam atau server error:", response.status);
        }
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="h-screen bg-[#eaf1fb] p-6 flex gap-4">
      <div className={`transition-all duration-300 ${isOpen ? "w-[280px]" : "w-[80px]"}`}>
        <AdminSidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      </div>

      <div className="flex-1">
        <div className="h-full bg-white/70 backdrop-blur-md rounded-2xl shadow-lg flex flex-col">
          <div className="border-b border-gray-200">
            <AdminHeader />
          </div>

          <div className="flex-1 p-6 overflow-auto space-y-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">
                Dashboard Statistik
              </h1>
              <p className="text-sm text-gray-500">
                Halo, {adminName}! Selamat Datang di Dashboard Statistik
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard 
                title="Total Regulasi" 
                value={isLoading ? "..." : dashboardData.stats.totalRegulations.toString()} 
                growth="+12% from last month" 
              />
              <StatCard 
                title="Pengguna Aktif" 
                value={isLoading ? "..." : dashboardData.stats.activeUsers.toString()} 
                growth="+5% from last month" 
              />
              <StatCard 
                title="Interaksi Sehari-hari" 
                value={isLoading ? "..." : dashboardData.stats.dailyInteractions.toString()} 
                growth="+10% from last month" 
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AdminPopularDocs dataDocs={dashboardData.dokumenTerpopuler} />
              <AdminActivityList dataIsu={dashboardData.isuTerkini} />
            </div>

            <div>
              <AdminChart dataTren={dashboardData.trenPencarian} />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}