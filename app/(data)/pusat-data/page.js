"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import DataList from "@/components/features/data/DataList";
import SubscriptionList from "@/components/features/subscription/SubscriptionList";
import AppShell from "@/components/layout/AppShell";

export default function PusatDataPage() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <AppShell
      sidebarOpen={isOpen}
      setSidebarOpen={setIsOpen}
      sidebar={
        <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      }
      header={
        <Header />
      }
    >
      <div className="h-full">
        <DataList />
      </div>
    </AppShell>
  );
}