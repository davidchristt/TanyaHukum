"use client";

import { useState, useEffect, useMemo } from "react";

import AdminSidebar from "@/components/layout/AdminSidebar";
import AdminHeader from "@/components/layout/AdminHeader";
import AppShell from "@/components/layout/AppShell";
import DashboardSection from "@/components/features/dashboard/DashboardSection";

import AdminPopularDocs from "@/components/features/dashboardAdmin/AdminPopularDocs";
import AdminActivityList from "@/components/features/dashboardAdmin/AdminActivityList";
import AdminChart from "@/components/features/dashboardAdmin/AdminChart";

// Utility
function formatBytes(bytes) {
  if (!bytes || bytes === 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

// Mini Stat Card
function MiniStatCard({ label, value, growth, icon, color = "blue", formatAsBytes = false }) {
  const [displayVal, setDisplayVal] = useState(0);
  const numVal = typeof value === 'number' ? value : parseInt(value) || 0;

  useEffect(() => {
    if (formatAsBytes) { setDisplayVal(numVal); return; }
    const duration = 900;
    const inc = numVal / (duration / 16);
    let cur = 0;
    const t = setInterval(() => {
      cur += inc;
      if (cur >= numVal) { setDisplayVal(numVal); clearInterval(t); }
      else setDisplayVal(Math.floor(cur));
    }, 16);
    return () => clearInterval(t);
  }, [numVal, formatAsBytes]);

  const colorMap = {
    blue: "from-blue-600 to-blue-500",
    emerald: "from-emerald-600 to-emerald-500",
    violet: "from-violet-600 to-violet-500",
    amber: "from-amber-500 to-orange-500",
    rose: "from-rose-500 to-pink-500",
    slate: "from-slate-700 to-slate-600",
    cyan: "from-cyan-600 to-cyan-500",
    indigo: "from-indigo-600 to-indigo-500",
    teal: "from-teal-600 to-teal-500",
    gray: "from-gray-600 to-gray-500",
  };

  return (
    <div className="group relative overflow-hidden rounded-[1.5rem] p-6 text-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl bg-gradient-to-br cursor-default"
      style={{ backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))` }}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${colorMap[color] || colorMap.blue}`} />
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-white/15 rounded-xl backdrop-blur-sm border border-white/10">
            <span className="text-lg">{icon}</span>
          </div>
          {growth && (
            <span className="text-[9px] font-black bg-white/20 px-2 py-0.5 rounded-md border border-white/10 uppercase tracking-widest">
              {growth}
            </span>
          )}
        </div>
        <p className="text-[9px] font-black text-white/60 uppercase tracking-widest mb-1">{label}</p>
        <h3 className="text-3xl font-black tracking-tight">
          {formatAsBytes ? formatBytes(displayVal) : displayVal.toLocaleString()}
        </h3>
      </div>
    </div>
  );
}

// Donut Chart (Pure CSS)
function DonutChart({ data, title }) {
  const total = data.reduce((s, d) => s + d.count, 0);
  const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899"];
  let cumPct = 0;
  const segments = data.map((d, i) => {
    const pct = total > 0 ? (d.count / total) * 100 : 0;
    const start = cumPct;
    cumPct += pct;
    return { ...d, pct, start, color: colors[i % colors.length] };
  });
  const gradient = segments.map(s => `${s.color} ${s.start}% ${s.start + s.pct}%`).join(', ');

  return (
    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 transition-all hover:shadow-md">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-1.5 h-5 bg-blue-600 rounded-full" />
        <h3 className="text-sm font-black text-gray-900">{title}</h3>
      </div>
      <div className="flex items-center gap-6">
        <div className="w-28 h-28 rounded-full shrink-0" style={{
          background: total > 0 ? `conic-gradient(${gradient})` : '#f3f4f6',
          mask: 'radial-gradient(farthest-side, transparent 55%, #000 56%)',
          WebkitMask: 'radial-gradient(farthest-side, transparent 55%, #000 56%)'
        }} />
        <div className="flex-1 space-y-2">
          {segments.slice(0, 5).map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: s.color }} />
              <span className="text-[10px] font-bold text-gray-600 truncate flex-1">{s.name}</span>
              <span className="text-[10px] font-black text-gray-900">{s.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [isOpen, setIsOpen] = useState(true);
  const [adminName, setAdminName] = useState("Admin");
  const [isLoading, setIsLoading] = useState(true);
  const [dashData, setDashData] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const userDataString = localStorage.getItem("user");
        let userId = "";
        if (userDataString) {
          const userData = JSON.parse(userDataString);
          userId = userData.id || "";
          if (userData.nama || userData.name) setAdminName(userData.nama || userData.name);
        }
        const response = await fetch('/api/admin/dashboard/stats', {
          cache: 'no-store',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userId}` },
          credentials: 'include'
        });
        if (response.ok) {
          const result = await response.json();
          if (result.success) setDashData(result.data);
        }
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const cards = dashData?.cards || {};
  const userDist = dashData?.userDistribution || { pro: 0, free: 0, admin: 0 };
  const catDist = dashData?.categoryDistribution || [];

  return (
    <AppShell isAdmin={true} sidebarOpen={isOpen} setSidebarOpen={setIsOpen} sidebar={<AdminSidebar />} header={<AdminHeader />}>
      <div className="p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* HERO */}
          <DashboardSection delay={100}>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black tracking-widest uppercase mb-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                  </span>
                  Admin Intelligence
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">Dashboard Statistik</h1>
                <p className="text-lg text-gray-500 font-medium max-w-2xl leading-relaxed">
                  Selamat datang, <span className="text-blue-600 font-bold">{adminName}</span>. Pantau performa platform melalui metrik real-time.
                </p>
              </div>
              <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-4 py-2 rounded-xl border border-gray-100 shrink-0">
                Last refresh: {new Date().toLocaleString("id-ID", { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
              </div>
            </div>
          </DashboardSection>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-96 space-y-4">
              <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
              <p className="text-sm font-bold text-gray-400 animate-pulse">Mengagregasi data analytics...</p>
            </div>
          ) : (
            <>
              {/* STAT CARDS GRID */}
              <DashboardSection delay={200}>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  <MiniStatCard label={cards.totalDocuments?.label} value={cards.totalDocuments?.value} growth={cards.totalDocuments?.growth} icon="📄" color="blue" />
                  <MiniStatCard label={cards.totalUsers?.label} value={cards.totalUsers?.value} growth={cards.totalUsers?.growth} icon="👥" color="violet" />
                  <MiniStatCard label={cards.activeUsersToday?.label} value={cards.activeUsersToday?.value} icon="🟢" color="emerald" />
                  <MiniStatCard label={cards.totalViews?.label} value={cards.totalViews?.value} icon="👁️" color="cyan" />
                  <MiniStatCard label={cards.chatRequestsToday?.label} value={cards.chatRequestsToday?.value} icon="💬" color="amber" />
                  <MiniStatCard label={cards.totalChatMessages?.label} value={cards.totalChatMessages?.value} icon="🗨️" color="indigo" />
                  <MiniStatCard label={cards.proUsers?.label} value={cards.proUsers?.value} icon="⭐" color="teal" />
                  <MiniStatCard label={cards.freeUsers?.label} value={cards.freeUsers?.value} icon="🆓" color="slate" />
                  <MiniStatCard label={cards.totalAdmins?.label} value={cards.totalAdmins?.value} icon="🛡️" color="rose" />
                  <MiniStatCard label={cards.storageUsed?.label} value={cards.storageUsed?.value} icon="💾" color="gray" formatAsBytes />
                </div>
              </DashboardSection>

              {/* MIDDLE ROW: CHARTS + DISTRIBUTIONS */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <DashboardSection delay={400} className="lg:col-span-2">
                  <AdminChart dataTren={dashData?.searchTrends || []} />
                </DashboardSection>
                <DashboardSection delay={500} className="space-y-6">
                  <DonutChart title="Distribusi Kategori" data={catDist} />
                  <DonutChart title="Distribusi Pengguna" data={[
                    { name: "Pro Members", count: userDist.pro },
                    { name: "Free Users", count: userDist.free },
                    { name: "Admin", count: userDist.admin },
                  ]} />
                </DashboardSection>
              </div>

              {/* BOTTOM ROW: POPULAR DOCS + ISU TERKINI */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <DashboardSection delay={600} className="lg:col-span-3">
                  <AdminPopularDocs dataDocs={dashData?.popularDocs || []} />
                </DashboardSection>
                <DashboardSection delay={700} className="lg:col-span-2">
                  <AdminActivityList />
                </DashboardSection>
              </div>

              {/* RECENT UPLOADS */}
              <DashboardSection delay={800}>
                <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 transition-all hover:shadow-md">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-1.5 h-5 bg-blue-600 rounded-full" />
                    <h3 className="text-sm font-black text-gray-900">Dokumen Terbaru</h3>
                  </div>
                  <div className="space-y-3">
                    {(dashData?.recentDocs || []).map((doc, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition group">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center border border-blue-100 shrink-0">
                            <span className="text-[8px] font-black text-blue-600">DOC</span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-black text-gray-900 truncate max-w-[300px]">{doc.name}</p>
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{doc.category || "—"}</p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-[10px] font-black text-gray-600">{doc.date ? new Date(doc.date).toLocaleDateString("id-ID", { day: 'numeric', month: 'short' }) : "—"}</p>
                          <p className="text-[9px] font-bold text-gray-400">{doc.size ? formatBytes(doc.size) : "—"}</p>
                        </div>
                      </div>
                    ))}
                    {(!dashData?.recentDocs || dashData.recentDocs.length === 0) && (
                      <div className="text-center py-8 text-sm font-bold text-gray-400 italic">Belum ada dokumen terbaru.</div>
                    )}
                  </div>
                </div>
              </DashboardSection>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}