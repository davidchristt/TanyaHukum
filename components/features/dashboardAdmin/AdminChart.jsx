import { useState } from "react";
import { useTheme } from "@/components/shared/ThemeProvider";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export default function AdminChart({ dataTren = [] }) {
  const [filterDays, setFilterDays] = useState(14);
  const { theme } = useTheme();
  const isDark = theme === "dark";
  
  const filteredData = dataTren.length > 0 ? dataTren.slice(-filterDays) : [];
  
  const chartData = filteredData.length === 1 
    ? [
        { date: "Sebelumnya", searches: 0 }, 
        ...filteredData,
        { date: "Sekarang", searches: filteredData[0].searches }
      ] 
    : filteredData;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm border border-gray-100 dark:border-slate-800 flex flex-col h-full group transition-all duration-300 hover:shadow-md transition-colors">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white transition-colors">
            Tren Pencarian Hukum
          </h3>
        </div>
        <select 
          value={filterDays}
          onChange={(e) => setFilterDays(Number(e.target.value))}
          className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 text-xs rounded-xl px-3 py-2 font-bold outline-none cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 transition transition-colors"
        >
          <option value={7}>7 Hari Terakhir</option>
          <option value={14}>14 Hari Terakhir</option>
          <option value={30}>30 Hari Terakhir</option>
        </select>
      </div>

      <div style={{ width: '100%', minHeight: '300px', height: '300px' }}>
        {dataTren.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorSearches" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#334155" : "#e5e7eb"} />
              
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: isDark ? '#94a3b8' : '#6b7280', fontSize: 12 }} 
                dy={10}
              />
              
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: isDark ? '#94a3b8' : '#6b7280', fontSize: 12 }}
                allowDecimals={false} 
              />
              
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: isDark ? '1px solid #334155' : 'none', 
                  backgroundColor: isDark ? '#0f172a' : '#ffffff',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' 
                }}
                labelStyle={{ fontWeight: 'bold', color: isDark ? '#f8fafc' : '#374151', marginBottom: '4px' }}
                itemStyle={{ color: '#3b82f6', fontWeight: '500' }}
                formatter={(value) => [`${value} Pencarian`, 'Total']}
              />
              
              <Area 
                type="monotone" 
                dataKey="searches" 
                stroke="#3b82f6" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorSearches)" 
                activeDot={{ r: 6, fill: "#1e40af", stroke: isDark ? "#0f172a" : "#fff", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full border border-dashed border-gray-200 dark:border-slate-800 rounded-xl flex items-center justify-center text-gray-400 dark:text-gray-600 text-sm transition-colors">
            Data tren belum tersedia
          </div>
        )}
      </div>
    </div>
  );
}