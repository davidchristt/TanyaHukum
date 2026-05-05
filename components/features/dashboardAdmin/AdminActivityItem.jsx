export default function AdminActivityItem({ item, onDelete }) {
  return (
    <div className="p-4 border rounded-xl flex items-start justify-between gap-4 hover:bg-gray-50 transition shadow-sm bg-white">
      {/* Container Teks */}
      <div className="flex-1">
        <p className="text-sm font-semibold text-gray-800 line-clamp-1">
          {item.title}
        </p>
        <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
          {item.desc}
        </p>
        <p className="text-xs text-gray-400 mt-3 font-medium">
          {item.time}
        </p>
      </div>

      {/* Container Tombol Hapus */}
      <button
        onClick={onDelete}
        // flex-shrink-0 adalah tameng utama agar tombol tidak menyusut!
        className="flex-shrink-0 p-2 rounded-lg hover:bg-blue-50 transition-all"
        title="Hapus Isu Terkini"
      >
        {/* Kita panggil kembali icon kebanggaan bos! */}
        <img src="/icons/hapus.svg" alt="Hapus" className="w-5 h-5" />
      </button>
    </div>
  );
}