"use client";

import { useState } from "react";

// 1. Layout
import AdminSidebar from "@/components/layout/AdminSidebar";
import AdminHeader from "@/components/layout/AdminHeader";
import AppShell from "@/components/layout/AppShell";

// 2. Fitur Khusus Halaman Data (Import dari folder baru pilihanmu)
import AdminDataList from "@/components/features/dataAdmin/AdminDataList";

export default function PusatDataHukumPage() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <AppShell
      isAdmin={true}
      sidebarOpen={isOpen}
      setSidebarOpen={setIsOpen}
      sidebar={<AdminSidebar />}
      header={<AdminHeader />}
    >
      <div className="p-8 md:p-10 max-w-7xl mx-auto animate-fade-down">
         <AdminDataList />
      </div>
    </AppShell>
  );
}