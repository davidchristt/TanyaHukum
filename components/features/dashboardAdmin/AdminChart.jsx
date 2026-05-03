"use client";

export default function AdminChart({ dataTren = [] }) {
  return (
    <div className="bg-white/80 rounded-2xl p-5 shadow-sm border border-blue-100">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Tren Pencarian Hukum
      </h3>

      <div className="h-64 border border-dashed rounded-xl flex flex-col p-4 overflow-y-auto gap-3">
        {dataTren.length > 0 ? (
          dataTren.map((tren, index) => (
            <div key={index} className="flex justify-between items-center p-3 bg-blue-50/50 rounded-lg">
              <span className="text-gray-600 text-sm">{tren.date}</span>
              <span className="font-semibold text-blue-600">{tren.searches} Pencarian</span>
            </div>
          ))
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400 text-sm">
            Data tren belum tersedia
          </div>
        )}
      </div>
    </div>
  );
}