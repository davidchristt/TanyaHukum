export default function PopularDocs({ docs }) {
  return (
    <div className="bg-white/80 rounded-2xl p-5 shadow-sm border border-blue-100 h-full">

      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Dokumen Terpopuler
      </h3>

      <div className="space-y-3">
        {docs && docs.length > 0 ? (
          docs.map((doc, i) => (
            <div key={i} className="flex justify-between items-center border-b pb-3 last:border-none">
              <p className="text-sm font-medium text-gray-800 line-clamp-2 pr-4">
                {doc.name}
              </p>
              <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-3 py-1 rounded-full whitespace-nowrap">
                {doc.views} views
              </span>
            </div>
          ))
        ) : (
          <div className="h-48 border border-dashed rounded-xl flex items-center justify-center text-gray-400 text-sm">
            Belum ada data dokumen
          </div>
        )}
      </div>

    </div>
  );
}