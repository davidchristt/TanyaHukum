"use client";

export default function AdminActivityItem({ item, onDelete, onView }) {
  return (
    <div className="group flex items-start gap-3 p-3 rounded-xl hover:bg-blue-50/30 transition relative cursor-pointer" onClick={onView}>
      <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 shrink-0 group-hover:bg-blue-600 transition" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-black text-gray-900 line-clamp-2 leading-relaxed">{item.title}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{item.time}</span>
          {item.location && (
            <>
              <span className="text-gray-200">·</span>
              <span className="text-[9px] font-bold text-gray-400">{item.location}</span>
            </>
          )}
        </div>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-100 transition shrink-0"
      >
        <img src="/icons/hapus.svg" alt="Hapus" className="w-3.5 h-3.5 opacity-50 hover:opacity-100 transition" />
      </button>
    </div>
  );
}