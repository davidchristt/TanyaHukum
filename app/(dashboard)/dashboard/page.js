"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

import StatCard from "@/components/features/dashboard/StatCard";
import ActivityList from "@/components/features/dashboard/ActivityList";
import ChartPlaceholder from "@/components/features/dashboard/ChartPlaceholder";
import PopularDocs from "@/components/features/dashboard/PopularDocs";

export default function DashboardPage() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="h-screen bg-[#eaf1fb] p-6 flex gap-4">

      {/* Sidebar */}
      <div
        className={`transition-all duration-300 ${
          isOpen ? "w-[280px]" : "w-[80px]"
        }`}
      >
        <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      </div>

      {/* Main Content */}
      <div className="flex-1">

        <div className="h-full bg-white/70 backdrop-blur-md rounded-2xl shadow-lg flex flex-col">

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

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard title="Total Regulasi" value="100" growth="+12%" />
              <StatCard title="Pengguna Aktif" value="1025" growth="+5%" />
              <StatCard title="Interaksi Sehari-hari" value="950" growth="+10%" />
            </div>

            {/* Row: Docs + Isu */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PopularDocs />
              <ActivityList />
            </div>

            {/* Chart Full Width */}
            <div>
              <ChartPlaceholder />
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}