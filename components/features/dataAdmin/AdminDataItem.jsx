"use client";

// Utility: format raw bytes into human-readable KB/MB
function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AdminDataItem({ index, item, onDelete, onEdit, onView }) {
  // Format Date
  const formattedDate = item.createdAt
    ? new Date(item.createdAt).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })
    : "—";

  // Detect file extension from filename or document title
  const fileName = item.fileName || item.dokumen || "";
  const ext = fileName.split('.').pop()?.toUpperCase() || "DOC";

  return (
    <tr className="group/row transition-all hover:bg-blue-50/30 dark:hover:bg-blue-900/10 cursor-pointer transition-colors" onClick={onView}>
      {/* INFORMASI DOKUMEN */}
      <td className="py-5 px-6 rounded-l-[1.5rem] border-y border-l border-transparent group-hover/row:border-blue-100 dark:group-hover/row:border-blue-900/30 group-hover/row:bg-blue-50/30 dark:group-hover/row:bg-blue-900/10 transition-colors">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center border border-blue-100 dark:border-blue-900/30 shrink-0 group-hover/row:bg-white dark:group-hover/row:bg-slate-800 transition-colors">
            <span className="text-[8px] font-black text-blue-600 dark:text-blue-400 uppercase transition-colors">{ext}</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-black text-gray-900 dark:text-white truncate max-w-[280px] transition-colors" title={item.dokumen}>
              {item.dokumen}
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest transition-colors">ID: {item.id?.slice(-6)}</span>
            </div>
          </div>
        </div>
      </td>

      {/* METADATA & KATEGORI */}
      <td className="py-5 px-4 border-y border-transparent group-hover/row:border-blue-100 dark:group-hover/row:border-blue-900/30 group-hover/row:bg-blue-50/30 dark:group-hover/row:bg-blue-900/10 transition-colors">
        <div className="flex flex-col gap-1.5">
          <div className="flex flex-wrap gap-2">
            <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[9px] font-black rounded-md border border-blue-100 dark:border-blue-900/30 uppercase tracking-tight transition-colors">
              {item.category}
            </span>
          </div>
          <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 line-clamp-1 max-w-[200px] transition-colors" title={item.deskripsi}>
            {item.deskripsi || "Tidak ada deskripsi"}
          </p>
        </div>
      </td>

      {/* UKURAN & VIEWS */}
      <td className="py-5 px-4 text-center border-y border-transparent group-hover/row:border-blue-100 dark:group-hover/row:border-blue-900/30 group-hover/row:bg-blue-50/30 dark:group-hover/row:bg-blue-900/10 transition-colors">
        <div className="inline-flex flex-col items-center">
          <span className="text-[11px] font-black text-gray-900 dark:text-white transition-colors">{formatFileSize(item.fileSize)}</span>
          <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest transition-colors">{item.viewCount || 0} Views</span>
        </div>
      </td>

      {/* TANGGAL UNGGAH */}
      <td className="py-5 px-4 text-center border-y border-transparent group-hover/row:border-blue-100 dark:group-hover/row:border-blue-900/30 group-hover/row:bg-blue-50/30 dark:group-hover/row:bg-blue-900/10 transition-colors">
        <div className="inline-flex flex-col items-center">
          <span className="text-[11px] font-black text-gray-900 dark:text-white transition-colors">{formattedDate}</span>
          <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest transition-colors">WIB</span>
        </div>
      </td>

      {/* ACTIONS */}
      <td className="py-5 px-6 rounded-r-[1.5rem] border-y border-r border-transparent group-hover/row:border-blue-100 dark:group-hover/row:border-blue-900/30 group-hover/row:bg-blue-50/30 dark:group-hover/row:bg-blue-900/10 text-right transition-colors">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="w-10 h-10 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl flex items-center justify-center hover:bg-blue-600 dark:hover:bg-blue-500 hover:border-blue-600 dark:hover:border-blue-500 group/edit transition-all shadow-sm active:scale-90 transition-colors"
          >
            <img src="/icons/edit.svg" alt="Edit" className="w-4 h-4 opacity-60 transition-all group-hover/edit:opacity-100 group-hover/edit:brightness-200" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="w-10 h-10 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl flex items-center justify-center hover:bg-red-500 hover:border-red-500 group/del transition-all shadow-sm active:scale-90 transition-colors"
          >
            <img src="/icons/hapus.svg" alt="Hapus" className="w-4 h-4 opacity-60 transition-all group-hover/del:opacity-100 group-hover/del:brightness-200" />
          </button>
        </div>
      </td>
    </tr>
  );
}