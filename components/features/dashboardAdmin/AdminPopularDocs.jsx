"use client";

export default function AdminPopularDocs({ dataDocs = [] }) {
  // Mencari nilai view tertinggi untuk referensi panjang bar chart
  const maxViews = dataDocs.length > 0 ? Math.max(...dataDocs.map(d => d.views)) : 1;

  return (
    <div className="bg-white/80 rounded-2xl p-5 shadow-sm border border-blue-100">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Dokumen Terpopuler
      </h3>

      <div className="flex flex-col gap-4 h-48 overflow-y-auto pr-2">
        {dataDocs.length > 0 ? (
          dataDocs.map((doc, index) => {
            const percentage = (doc.views / maxViews) * 100;
            return (
              <div key={index} className="flex flex-col gap-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-700">{doc.name}</span>
                  <span className="text-gray-500">{doc.views} Views</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="h-full border border-dashed rounded-xl flex items-center justify-center text-gray-400 text-sm">
            Data dokumen belum tersedia
          </div>
        )}
      </div>
    </div>
  );
}