"use client";

import { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";
import DocumentDetailModal from "../data/DocumentDetailModal";
import { useRef } from "react";

export default function PopularDocs({ docs = [] }) {
  const [view, setView] = useState("list"); // "list" | "chart"
  const [timeRange, setTimeRange] = useState("7d");
  const [selectedDoc, setSelectedDoc] = useState(null);
  const trackedDocs = useRef(new Set()); // Anti-spam per session

  const ranges = [
    { id: "7d", label: "7 Hari" },
    { id: "30d", label: "30 Hari" },
    { id: "3m", label: "3 Bulan" },
    { id: "1y", label: "1 Tahun" },
  ];

  const maxViews = useMemo(() => {
    if (!docs.length) return 0;
    return Math.max(...docs.map(d => d.views || 0));
  }, [docs]);

  // Chart data format
  const chartData = useMemo(() => {
    return docs.slice(0, 5).map(doc => ({
      name: doc.name.length > 20 ? doc.name.substring(0, 20) + "..." : doc.name,
      fullName: doc.name,
      views: doc.views || 0,
      original: doc // Simpan doc asli buat modal
    })).sort((a, b) => b.views - a.views);
  }, [docs]);

  // Fungsi untuk menambah view count (Sama dengan DataList)
  const handleIncrementView = async (docId, actionType = 'view') => {
    const trackKey = `${docId}:${actionType}`;
    if (!docId || trackedDocs.current.has(trackKey)) return;

    try {
      // Kita tidak update local docs prop di sini karena datang dari parent, 
      // tapi kita update UI state modal jika sedang terbuka
      if (selectedDoc?.id === docId) {
        setSelectedDoc(prev => ({ ...prev, viewCount: (prev.viewCount || 0) + 1, views: (prev.views || 0) + 1 }));
      }

      trackedDocs.current.add(trackKey);

      await fetch(`/api/regulations/${docId}`, { method: 'PATCH' });
    } catch (error) {
      console.error("Error incrementing viewCount:", error);
    }
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800/80 p-3 border border-gray-100 dark:border-slate-700 shadow-xl rounded-xl transition-colors">
          <p className="text-xs font-bold text-gray-900 dark:text-white mb-1 max-w-[200px] break-words transition-colors">
            {payload[0].payload.fullName}
          </p>
          <p className="text-sm text-blue-600 dark:text-blue-400 font-bold">
            {payload[0].value} Views
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm border border-gray-100 dark:border-slate-800 flex flex-col h-[600px] group transition-all duration-300 hover:shadow-md">
      
      {/* Header with Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 transition-colors">
            <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
            Dokumen Terpopuler
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 transition-colors">Berdasarkan jumlah kunjungan unik</p>
        </div>

        <div className="flex items-center gap-2 bg-gray-50 dark:bg-slate-800 p-1 rounded-xl border border-transparent dark:border-slate-700 transition-colors">
          <button
            onClick={() => setView("list")}
            className={`p-1.5 rounded-lg transition-all ${view === "list" ? "bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400" : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </button>
          <button
            onClick={() => setView("chart")}
            className={`p-1.5 rounded-lg transition-all ${view === "chart" ? "bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400" : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Time Range Filter */}
      <div className="flex items-center gap-1.5 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        {ranges.map((r) => (
          <button
            key={r.id}
            onClick={() => setTimeRange(r.id)}
            className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all whitespace-nowrap border ${
              timeRange === r.id 
                ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200 dark:shadow-none" 
                : "bg-white dark:bg-slate-800 text-gray-500 dark:text-gray-400 border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
        {docs && docs.length > 0 ? (
          view === "list" ? (
            <div className="space-y-5">
              {docs.slice(0, 10).map((doc, i) => (
                <div 
                  key={i} 
                  onClick={() => {
                    setSelectedDoc(doc);
                    handleIncrementView(doc.id, 'view');
                  }}
                  className="group/item relative cursor-pointer hover:bg-gray-50/50 dark:hover:bg-slate-800/50 p-2 -m-2 rounded-2xl transition-all active:scale-[0.98]"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-start gap-3">
                      <span className={`flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black tracking-tighter ${
                        i === 0 ? "bg-blue-600 text-white shadow-sm shadow-blue-200 dark:shadow-none" : 
                        i === 1 ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" :
                        i === 2 ? "bg-blue-50 dark:bg-slate-800 text-blue-500 dark:text-blue-400" : "bg-gray-50 dark:bg-slate-800 text-blue-400 dark:text-blue-500"
                      }`}>
                        #{i + 1}
                      </span>
                      <div>
                        <p className="text-sm font-bold text-gray-800 dark:text-gray-200 line-clamp-1 group-hover/item:text-blue-600 dark:group-hover/item:text-blue-400 transition-colors">
                          {doc.name}
                        </p>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium transition-colors">{doc.category || "Legal Document"} • Document</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-black text-gray-900 dark:text-gray-200 bg-gray-50 dark:bg-slate-800 px-2 py-0.5 rounded-lg group-hover/item:bg-blue-50 dark:group-hover/item:bg-blue-900/20 group-hover/item:text-blue-600 dark:group-hover/item:text-blue-400 transition-all">
                      {doc.views?.toLocaleString()} <span className="text-gray-400 dark:text-gray-500 font-medium uppercase tracking-tighter group-hover/item:text-blue-400">Views</span>
                    </span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full h-1.5 bg-gray-50 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ease-out ${
                        i === 0 ? "bg-blue-600" : "bg-blue-400"
                      }`}
                      style={{ width: `${(doc.views / maxViews) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={chartData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  barSize={12}
                >
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: '#6b7280', fontSize: 11, fontWeight: 700 }}
                    width={100}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                  <Bar dataKey="views" radius={[0, 4, 4, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={index === 0 ? '#2563eb' : '#60a5fa'} 
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => {
                          setSelectedDoc(entry.original);
                          handleIncrementView(entry.original.id, 'view');
                        }}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )
        ) : (
          <div className="h-full border-2 border-dashed border-gray-100 dark:border-slate-800 rounded-3xl flex flex-col items-center justify-center p-8 text-center transition-colors">
            <div className="w-12 h-12 bg-gray-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-sm font-bold text-gray-400 dark:text-gray-500 italic transition-colors">Belum ada data dokumen terpopuler</p>
          </div>
        )}
      </div>

      <DocumentDetailModal
        isOpen={!!selectedDoc}
        onClose={() => setSelectedDoc(null)}
        document={selectedDoc}
        onIncrementView={handleIncrementView}
      />
    </div>
  );
}