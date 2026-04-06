const data = [
  {
    title: "Maling Helm di unpad",
    desc: "Pelaku kabur ke Pangdam",
    time: "2 J Lalu",
  },
  {
    title: "Aksi demo gedung sate",
    desc: "Demo berlangsung siang hari",
    time: "11 J Lalu",
  },
  {
    title: "Begal di jatinangor",
    desc: "Pelaku kabur lewat gang",
    time: "1 H Lalu",
  },
  {
    title: "Uang 1T hilang",
    desc: "Pelaku belum tertangkap",
    time: "2 H Lalu",
  },
];

export default function ActivityList() {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">

      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Isu Terkini
      </h3>

      <div className="space-y-3">
        {data.map((item, i) => (
          <div key={i} className="border-b pb-2 last:border-none">
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
        ))}
      </div>

    </div>
  );
}