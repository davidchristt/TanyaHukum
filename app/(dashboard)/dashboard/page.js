"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

import StatCard from "@/components/features/dashboard/StatCard";
import ActivityList from "@/components/features/dashboard/ActivityList";
import ChartPlaceholder from "@/components/features/dashboard/ChartPlaceholder";
import PopularDocs from "@/components/features/dashboard/PopularDocs";
import DashboardSection from "@/components/features/dashboard/DashboardSection";
import ProfileModal from "@/components/features/profile/ProfileModal";
import SubscriptionModal from "@/components/features/subscription/SubscriptionModal";
import AuthModal from "@/components/features/auth/AuthModal";
import AppShell from "@/components/layout/AppShell";

export default function DashboardPage() {
  const [isOpen, setIsOpen] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [user, setUser] = useState(null);

  // Modal States
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false);
  const [authModal, setAuthModal] = useState({ isOpen: false, mode: "login" });

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
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

    // Load User
    const loadUser = () => {
      const stored = localStorage.getItem("user");
      if (stored) setUser(JSON.parse(stored));
    };
    loadUser();
    window.addEventListener("auth-change", loadUser);

    // Update time for real-time indicator
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => {
      clearInterval(timer);
      window.removeEventListener("auth-change", loadUser);
    };
  }, []);

  const formatDate = (date) => {
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };


  return (
    <AppShell
      sidebarOpen={isOpen}
      setSidebarOpen={setIsOpen}
      sidebar={
        <Sidebar 
          isOpen={isOpen} 
          setIsOpen={setIsOpen} 
          onOpenProfile={() => setIsProfileOpen(true)}
        />
      }
      header={
        <Header 
          onOpenSubscription={() => setIsSubscriptionOpen(true)}
          onOpenAuth={(mode) => setAuthModal({ isOpen: true, mode })}
        />
      }
    >
      <div className="p-8">
        <div className="max-w-7xl mx-auto space-y-10">
          
          {/* HERO GREETING SECTION */}
          <DashboardSection delay={100}>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black tracking-widest uppercase mb-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                  </span>
                  Live Analytics
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
                  Dashboard Statistik
                </h1>
                <p className="text-lg text-gray-500 font-medium max-w-2xl leading-relaxed">
                  Pantau aktivitas dan tren hukum secara <span className="text-blue-600 font-bold underline decoration-blue-200 underline-offset-4">real-time</span>. Insight terbaru dari interaksi pengguna dan regulasi.
                </p>
              </div>

              <div className="flex flex-col items-end gap-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Waktu Server</p>
                <p className="text-sm font-bold text-gray-900 bg-gray-50 px-4 py-2 rounded-2xl border border-gray-100 shadow-sm">
                  {formatDate(currentTime)} • {currentTime.toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          </DashboardSection>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-96 space-y-4">
              <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
              <p className="text-sm font-bold text-gray-400 animate-pulse">Menyiapkan data analytics...</p>
            </div>
          ) : (
            <>
              {/* STAT CARDS SECTION */}
              <DashboardSection delay={300}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <StatCard
                    title="Total Regulasi"
                    value={dashboardData?.summary?.total_regulasi?.value || 0}
                  />
                  <StatCard
                    title="Pengguna Aktif"
                    value={dashboardData?.summary?.pengguna_aktif?.value || 0}
                  />
                  <StatCard
                    title="Interaksi Harian"
                    value={dashboardData?.summary?.interaksi_harian?.value || 0}
                  />
                </div>
              </DashboardSection>

              {/* MIDDLE SECTION: POPULAR DOCS + ACTIVITY */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <DashboardSection delay={500} className="lg:col-span-3">
                  <PopularDocs docs={dashboardData?.dokumen_terpopuler || []} />
                </DashboardSection>
                
                <DashboardSection delay={600} className="lg:col-span-2">
                  <ActivityList issues={dashboardData?.isu_terkini || []} />
                </DashboardSection>
              </div>

              {/* BOTTOM SECTION: TREND CHART */}
              <DashboardSection delay={700}>
                <ChartPlaceholder trends={dashboardData?.tren_pencarian || []} />
              </DashboardSection>
            </>
          )}

        </div>
      </div>

      {/* Modals */}
      <ProfileModal 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
        user={user}
      />
      
      <SubscriptionModal 
        isOpen={isSubscriptionOpen} 
        onClose={() => setIsSubscriptionOpen(false)} 
        user={user}
      />

      <AuthModal 
        isOpen={authModal.isOpen} 
        onClose={() => setAuthModal({ ...authModal, isOpen: false })} 
        initialMode={authModal.mode}
      />
    </AppShell>
  );
}