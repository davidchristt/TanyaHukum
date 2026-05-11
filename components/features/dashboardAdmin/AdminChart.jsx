"use client";

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
  const chartData = dataTren.length === 1 
    ? [
        { date: "Sebelumnya", searches: 0 }, 
        ...dataTren,
        { date: "Sekarang", searches: dataTren[0].searches }
      ] 
    : dataTren;

  return (
    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 flex flex-col h-full group transition-all duration-300 hover:shadow-md">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
        <h3 className="text-lg font-bold text-gray-900">
          Tren Pencarian Hukum
        </h3>
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
              
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#6b7280', fontSize: 12 }} 
                dy={10}
              />
              
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#6b7280', fontSize: 12 }}
                allowDecimals={false} 
              />
              
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                labelStyle={{ fontWeight: 'bold', color: '#374151', marginBottom: '4px' }}
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
                activeDot={{ r: 6, fill: "#1e40af", stroke: "#fff", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full border border-dashed rounded-xl flex items-center justify-center text-gray-400 text-sm">
            Data tren belum tersedia
          </div>
        )}
      </div>
    </div>
  );
}