"use client";

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AdminPopularDocs({ dataDocs = [], onItemClick }) {
  const maxViews = dataDocs.length > 0 ? Math.max(...dataDocs.map(d => d.views)) : 1;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-sm border border-gray-100 dark:border-slate-800 flex flex-col h-full transition-all duration-300 hover:shadow-md transition-colors">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-5 bg-blue-600 rounded-full" />
          <h3 className="text-sm font-black text-gray-900 dark:text-white transition-colors">Dokumen Terpopuler</h3>
        </div>
        <span className="text-[8px] font-black text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-slate-800/50 px-2 py-0.5 rounded border border-gray-100 dark:border-slate-700 uppercase transition-colors">Top {dataDocs.length}</span>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
        {dataDocs.length > 0 ? (
          <div className="space-y-4">
            {dataDocs.map((doc, index) => {
              const percentage = maxViews > 0 ? (doc.views / maxViews) * 100 : 0;
              return (
                <div 
                  key={index} 
                  className={`group p-3 rounded-xl transition-all ${onItemClick ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800/50' : 'hover:bg-gray-50 dark:hover:bg-slate-800/50'}`}
                  onClick={() => onItemClick && onItemClick(doc)}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-7 h-7 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center border border-blue-100 dark:border-blue-900/30 shrink-0 transition-colors">
                        <span className="text-[9px] font-black text-blue-600 dark:text-blue-400">#{index + 1}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-black text-gray-900 dark:text-white truncate max-w-[250px] transition-colors">{doc.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {doc.category && (
                            <span className="text-[8px] font-black text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-1.5 py-0.5 rounded border border-blue-100 dark:border-blue-900/30 uppercase transition-colors">{doc.category}</span>
                          )}
                          {doc.size && (
                            <span className="text-[8px] font-bold text-gray-400 dark:text-gray-500 transition-colors">{formatBytes(doc.size)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <span className="text-sm font-black text-blue-600 dark:text-blue-400 shrink-0 transition-colors">{doc.views.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-slate-800 rounded-full h-1 overflow-hidden transition-colors">
                    <div
                      className="bg-blue-500 h-full rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-full border-2 border-dashed border-gray-100 dark:border-slate-800 rounded-[1.5rem] flex items-center justify-center p-6 transition-colors">
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 italic">Data belum tersedia</p>
          </div>
        )}
      </div>
    </div>
  );
}