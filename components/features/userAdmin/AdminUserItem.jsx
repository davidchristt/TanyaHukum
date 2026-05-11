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
    <tr className="group/row hover:bg-blue-50/40 transition-colors border-b border-gray-50 last:border-0">
      
      {/* IDENTITY */}
      <td className="py-5 px-6">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm border border-white shadow-sm overflow-hidden shrink-0">
             {item.name ? item.name.charAt(0).toUpperCase() : item.email.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-black text-gray-900 truncate tracking-tight">{item.name || "Unnamed User"}</p>
            <p className="text-[11px] text-gray-400 font-medium truncate">{item.email}</p>
          </div>
        </div>
      </td>

      {/* ROLE & TIER */}
      <td className="py-5 px-4">
        <div className="flex flex-col gap-1.5">
           <div className={`inline-flex self-start px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
             item.role === 'ADMIN' 
               ? "bg-purple-50 text-purple-600 border-purple-100" 
               : "bg-gray-100 text-gray-500 border-gray-200"
           }`}>
             {item.role}
           </div>
           <div className={`inline-flex self-start px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
             item.tier === 'PRO' 
               ? "bg-amber-50 text-amber-600 border-amber-100" 
               : "bg-blue-50 text-blue-500 border-blue-100"
           }`}>
             {item.tier} MEMBER
           </div>
        </div>
      </td>

      {/* LIMIT & QUOTA */}
      <td className="py-5 px-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden max-w-[80px]">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ${
                  item.promptLimit === 0 
                    ? "bg-emerald-500 w-full" 
                    : (item.remainingQuota / item.promptLimit) < 0.2 ? "bg-red-500" : "bg-blue-500"
                }`}
                style={{ width: item.promptLimit === 0 ? "100%" : `${(item.remainingQuota / item.promptLimit) * 100}%` }}
              />
            </div>
            <span className={`text-[11px] font-black ${item.promptLimit === 0 ? "text-emerald-600" : "text-gray-900"}`}>
              {item.promptLimit === 0 ? "UNLIMITED" : (
                <>
                  {item.remainingQuota}
                  <span className="text-gray-400">/{item.promptLimit}</span>
                </>
              )}
            </span>
          </div>
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
            {item.promptLimit === 0 ? "Akses Tanpa Batas" : "Sisa Quota Hari Ini"}
          </p>
        </div>
      </td>

      {/* JOINED */}
      <td className="py-5 px-4 text-center">
        <p className="text-sm font-bold text-gray-700">{formatDate(item.createdAt)}</p>
        <p className="text-[10px] text-gray-400 font-medium">Terdaftar</p>
      </td>

      {/* LAST ACTIVE */}
      <td className="py-5 px-4 text-center">
        <p className={`text-sm font-bold ${item.lastActive ? "text-blue-600" : "text-gray-400"}`}>
          {getRelativeTime(item.lastActive)}
        </p>
        <p className="text-[10px] text-gray-400 font-medium">Aktivitas Chat</p>
      </td>

      {/* ACTIONS */}
      <td className="py-5 px-6">
        <div className="flex items-center justify-end gap-2 transition-all">
          <button 
            onClick={onEdit}
            className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center hover:bg-blue-50 hover:border-blue-300 hover:shadow-md transition-all active:scale-90 shadow-sm"
            title="Edit User"
          >
            <img src="/icons/edit.svg" alt="Edit" className="w-4 h-4 opacity-100" />
          </button>
          
          <button 
            onClick={onDelete}
            className="w-10 h-10 bg-white border border-red-100 rounded-xl flex items-center justify-center hover:bg-red-50 hover:border-red-200 transition-all shadow-sm active:scale-90 group/del hover:shadow-md"
            title="Delete User"
          >
            <img src="/icons/hapus.svg" alt="Delete" className="w-4 h-4 opacity-80 group-hover/del:opacity-100 transition-opacity" />
          </button>
        </div>
      </td>

    </tr>
  );
}