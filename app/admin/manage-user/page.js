"use client";

import { useState } from "react";

// 1. Layout
import AdminSidebar from "@/components/layout/AdminSidebar";
import AdminHeader from "@/components/layout/AdminHeader";
import AppShell from "@/components/layout/AppShell";

// 2. Fitur Khusus Halaman Manage User
import AdminUserList from "@/components/features/userAdmin/AdminUserList";

export default function ManageUserPage() {
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
         <AdminUserList />
      </div>
    </AppShell>
  );
}