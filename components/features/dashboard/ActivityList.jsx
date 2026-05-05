export default function ActivityList({ issues }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 h-full">

      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Isu Terkini
      </h3>

      <div className="space-y-3">
        {issues && issues.length > 0 ? (
          issues.map((item, i) => (
            <div key={item.id || i} className="border-b pb-2 last:border-none">
              <p className="text-sm font-medium text-gray-800">
                {item.title}
              </p>
              {/* Jika tabel Prisma kamu pakai 'description', ganti 'desc' jadi 'description' */}
              <p className="text-xs text-gray-500">
                {item.description || item.desc}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {/* Format tanggal bawaan Prisma agar rapi */}
                {new Date(item.publishDate).toLocaleDateString("id-ID", {
                  day: 'numeric', month: 'long', year: 'numeric'
                })}
              </p>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500 text-center py-4">Belum ada isu terkini.</p>
        )}
      </div>

    </div>
  );
}