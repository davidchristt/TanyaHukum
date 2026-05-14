"use client";

export default function AdminUserItem({ index, item, onDelete, onEdit }) {
  
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getRelativeTime = (dateString) => {
    if (!dateString) return "Belum Aktif";
    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${diffMins}m lalu`;
    if (diffHours < 24) return `${diffHours}j lalu`;
    if (diffDays < 7) return `${diffDays} hari lalu`;
    return formatDate(dateString);
  };

  return (
    <tr className="group/row hover:bg-blue-50/40 dark:hover:bg-blue-900/10 transition-colors border-b border-gray-50 dark:border-slate-800 last:border-0 transition-colors">
      
      {/* IDENTITY */}
      <td className="py-5 px-6">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-sm border border-white dark:border-slate-700 shadow-sm overflow-hidden shrink-0 transition-colors">
             {item.name ? item.name.charAt(0).toUpperCase() : item.email.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-black text-gray-900 dark:text-white truncate tracking-tight transition-colors">{item.name || "Unnamed User"}</p>
            <p className="text-[11px] text-gray-400 dark:text-gray-500 font-medium truncate transition-colors">{item.email}</p>
          </div>
        </div>
      </td>

      {/* ROLE & TIER */}
      <td className="py-5 px-4">
        <div className="flex flex-col gap-1.5">
           <div className={`inline-flex self-start px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-colors ${
             item.role === 'ADMIN' 
               ? "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-900/30" 
               : "bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-slate-700"
           }`}>
             {item.role}
           </div>
           <div className={`inline-flex self-start px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-colors ${
             item.tier === 'PRO' 
               ? "bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400 border-cyan-100 dark:border-cyan-900/30" 
               : "bg-blue-50 dark:bg-blue-900/20 text-blue-500 dark:text-blue-400 border-blue-100 dark:border-blue-900/30"
           }`}>
             {item.tier} MEMBER
           </div>
        </div>
      </td>

      {/* LIMIT & QUOTA */}
      <td className="py-5 px-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden max-w-[80px] transition-colors">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ${
                  item.promptLimit === 0 
                    ? "bg-emerald-500 w-full" 
                    : (item.remainingQuota / item.promptLimit) < 0.2 ? "bg-red-500" : "bg-blue-500"
                }`}
                style={{ width: item.promptLimit === 0 ? "100%" : `${(item.remainingQuota / item.promptLimit) * 100}%` }}
              />
            </div>
            <span className={`text-[11px] font-black transition-colors ${item.promptLimit === 0 ? "text-emerald-600 dark:text-emerald-400" : "text-gray-900 dark:text-white"}`}>
              {item.promptLimit === 0 ? "UNLIMITED" : (
                <>
                  {item.remainingQuota}
                  <span className="text-gray-400 dark:text-gray-500">/{item.promptLimit}</span>
                </>
              )}
            </span>
          </div>
          <p className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest transition-colors">
            {item.promptLimit === 0 ? "Akses Tanpa Batas" : "Sisa Quota Hari Ini"}
          </p>
        </div>
      </td>

      {/* JOINED */}
      <td className="py-5 px-4 text-center">
        <p className="text-sm font-bold text-gray-700 dark:text-gray-300 transition-colors">{formatDate(item.createdAt)}</p>
        <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium transition-colors">Terdaftar</p>
      </td>

      {/* LAST ACTIVE */}
      <td className="py-5 px-4 text-center">
        <p className={`text-sm font-bold transition-colors ${item.lastActive ? "text-blue-600 dark:text-blue-400" : "text-gray-400 dark:text-gray-500"}`}>
          {getRelativeTime(item.lastActive)}
        </p>
        <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium transition-colors">Aktivitas Chat</p>
      </td>

      {/* ACTIONS */}
      <td className="py-5 px-6">
        <div className="flex items-center justify-end gap-2 transition-all">
          <button 
            onClick={onEdit}
            className="w-10 h-10 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl flex items-center justify-center hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all active:scale-90 shadow-sm transition-colors"
            title="Edit User"
          >
            <img src="/icons/edit.svg" alt="Edit" className="w-4 h-4 opacity-70 transition-all" />
          </button>
          
          <button 
            onClick={onDelete}
            className="w-10 h-10 bg-white dark:bg-slate-800 border border-red-100 dark:border-red-900/30 rounded-xl flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-200 dark:hover:border-red-700 transition-all shadow-sm active:scale-90 group/del hover:shadow-md transition-colors"
            title="Delete User"
          >
            <img src="/icons/hapus.svg" alt="Delete" className="w-4 h-4 opacity-80 transition-opacity group-hover/del:opacity-100" />
          </button>
        </div>
      </td>

    </tr>
  );
}