"use client";

export default function AdminActivityItem({ item, onDelete, onView, onEdit }) {
  return (
    <div className="group flex items-start gap-3 p-3 rounded-xl hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition relative cursor-pointer transition-colors" onClick={onView}>
      <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 shrink-0 group-hover:bg-blue-600 transition" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-black text-gray-900 dark:text-white line-clamp-2 leading-relaxed transition-colors">{item.title}</p>
        <div className="flex items-center gap-2 mt-1 transition-colors">
          <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{item.time}</span>
          {item.location && (
            <>
              <span className="text-gray-200 dark:text-gray-700">·</span>
              <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500">{item.location}</span>
            </>
          )}
        </div>
      </div>
      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 shrink-0 transition">
        <button
          onClick={(e) => { e.stopPropagation(); onEdit?.(); }}
          className="p-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/20 transition"
          title="Edit"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition"
          title="Hapus"
        >
          <img src="/icons/hapus.svg" alt="Hapus" className="w-3.5 h-3.5 opacity-50 hover:opacity-100 transition" />
        </button>
      </div>
    </div>
  );
}