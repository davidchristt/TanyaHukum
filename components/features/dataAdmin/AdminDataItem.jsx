export default function AdminDataItem({ index, item, onDelete, onEdit }) {
  return (
    <div className="flex items-center justify-between p-4 hover:bg-blue-50/50 rounded-xl transition border-b border-transparent hover:border-blue-100 group/row">
      
      {/* KIRI: Data Text */}
      <div className="grid grid-cols-12 gap-4 w-full items-center">
        <p className="col-span-1 text-sm font-medium text-gray-800 text-center">
          {index + 1}
        </p>
        
        {/* Nama Dokumen (Porsi col-span-6) */}
        <p className="col-span-6 text-sm font-medium text-gray-800 truncate pr-4">
          {item.dokumen}
        </p>
        
        {/* Kategori (Porsi col-span-2) Dibuat pakai Badge biar rapi */}
        <div className="col-span-2 flex justify-center">
          <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full border border-gray-200 truncate max-w-full">
            {item.category}
          </span>
        </div>

        {/* Deskripsi (Porsi col-span-3) */}
        <p className="col-span-3 text-sm text-gray-600 truncate">
          {item.deskripsi || "-"}
        </p>
      </div>

      {/* KANAN: Action Buttons */}
      <div className="flex items-center gap-2 ml-4 shrink-0 w-[80px] justify-end">
        {/* Tombol Edit */}
        <button 
          onClick={onEdit}
          className="w-9 h-9 bg-blue-300/40 rounded-lg flex items-center justify-center hover:bg-blue-300 transition shadow-sm shrink-0"
        >
          <img src="/icons/edit.svg" alt="Edit" className="w-4 h-4 opacity-70" />
        </button>
        
        {/* Tombol Delete */}
        <button 
          onClick={onDelete}
          className="w-9 h-9 bg-blue-300/40 rounded-lg flex items-center justify-center hover:bg-red-400 transition group/del shadow-sm shrink-0"
        >
          <img src="/icons/hapus.svg" alt="Delete" className="w-4 h-4 opacity-70 group-hover/del:opacity-100" />
        </button>
      </div>

    </div>
  );
}