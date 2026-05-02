export default function AdminActivityItem({ item, onDelete }) {
  return (
    <div className="p-3 border rounded-xl flex items-center justify-between hover:bg-gray-50 transition">
      <div>
        <p className="text-sm font-medium text-gray-800">
          {item.title}
        </p>
        <p className="text-xs text-gray-500">
          {item.desc}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {item.time}
        </p>
      </div>

      <button
        onClick={onDelete}
        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
      >
        <img src="/icons/hapus.svg" className="w-5 h-5" />
      </button>
    </div>
  );
}