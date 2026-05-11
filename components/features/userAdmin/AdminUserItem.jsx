export default function AdminUserItem({ index, item, onDelete, onEdit }) {
  return (
    <div className="flex items-center justify-between p-4 hover:bg-blue-50/50 rounded-xl transition border-b border-transparent hover:border-blue-100 group/row">
      
      <div className="grid grid-cols-12 gap-4 w-full items-center">
        <p className="col-span-1 text-sm font-medium text-gray-800 text-center">
          {index + 1}
        </p>
        {/* Kolom 3 diganti menampilkan Email */}
        <p className="col-span-3 text-sm font-medium text-gray-800 truncate pr-2">
          {item.email}
        </p>
        {/* Kolom 5 diganti menampilkan Tier dan Prompt Limit */}
        <p className="col-span-5 text-sm text-gray-600 truncate pr-2">
          {item.tier} (Sisa Kuota: {item.promptLimit})
        </p>
        {/* Role dari backend biasanya text "ADMIN"/"USER", kita tampilkan langsung */}
        <p className="col-span-1 text-sm font-semibold text-gray-800 text-center">
          {item.role}
        </p>
        
        <div className="col-span-2 flex items-center justify-end gap-2 pr-2">
          <button 
            onClick={onEdit}
            className="w-9 h-9 bg-blue-300/40 rounded-lg flex items-center justify-center hover:bg-blue-300 transition shadow-sm"
          >
            <img src="/icons/edit.svg" alt="Edit" className="w-4 h-4 opacity-70" />
          </button>
          
          <button 
            onClick={onDelete}
            className="w-9 h-9 bg-blue-300/40 rounded-lg flex items-center justify-center hover:bg-red-400 transition group/del shadow-sm"
          >
            <img src="/icons/hapus.svg" alt="Delete" className="w-4 h-4 opacity-70 group-hover/del:opacity-100" />
          </button>
        </div>
      </div>

    </div>
  );
}