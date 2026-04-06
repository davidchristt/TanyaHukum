export default function DataList() {
  const data = [
    "UU No 1 Tahun 2023 KUHP",
    "UU ITE Revisi 2024",
    "UU Perlindungan Konsumen",
  ];

  return (
    <div className="h-full bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-lg">
      
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Pusat Data Hukum
      </h2>

      <div className="space-y-3">
        {data.map((item, i) => (
          <div
            key={i}
            className="p-4 border rounded-xl hover:bg-gray-50 cursor-pointer"
          >
            {item}
          </div>
        ))}
      </div>

    </div>
  );
}