export default function AdminDataItem({ index, item, onDelete, onEdit }) {
  return (
    <div className="flex items-center justify-between p-4 hover:bg-blue-50/50 rounded-xl transition border-b border-transparent hover:border-blue-100 group/row">
      
      {/* KIRI: Data Text */}
      <div className="grid grid-cols-12 gap-4 w-full items-center">
        <p className="col-span-1 text-sm font-medium text-gray-800 text-center">
          {index + 1}
        </p>
        <p className="col-span-5 text-sm font-medium text-gray-800 truncate pr-4">
          {item.dokumen}
        </p>
        <p className="col-span-6 text-sm text-gray-600 truncate">
          {item.deskripsi}
        </p>
      </div>

      {/* KANAN: Action Buttons */}
      <div className="flex items-center gap-2 ml-4">
        {/* Tombol Edit */}
        <button 
          onClick={onEdit}
          className="w-9 h-9 bg-blue-300/40 rounded-lg flex items-center justify-center hover:bg-blue-300 transition shadow-sm"
        >
          <img src="/icons/edit.svg" alt="Edit" className="w-4 h-4 opacity-70" />
        </button>
        
        {/* Tombol Delete */}
        <button 
          onClick={onDelete}
          className="w-9 h-9 bg-blue-300/40 rounded-lg flex items-center justify-center hover:bg-red-400 transition group/del shadow-sm"
        >
          <img src="/icons/hapus.svg" alt="Delete" className="w-4 h-4 opacity-70 group-hover/del:opacity-100" />
        </button>
      </div>

    </div>
  );
}