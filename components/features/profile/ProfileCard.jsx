export default function ProfileCard() {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-md flex items-center gap-4">

      <div className="w-20 h-20 rounded-full border-4 border-blue-400 flex items-center justify-center">
        <div className="w-10 h-10 bg-blue-400 rounded-full" />
      </div>

      <div className="flex-1">
        <h2 className="text-xl font-semibold text-gray-800">
          David
        </h2>
        <p className="text-sm text-gray-500">
          david@gmail.com
        </p>

        <div className="flex gap-2 mt-2">
          <button className="px-4 py-1 rounded-lg bg-blue-400 text-white text-sm">
            Unggah Foto
          </button>
          <button className="px-4 py-1 rounded-lg bg-red-500 text-white text-sm">
            Keluar
          </button>
        </div>
      </div>

    </div>
  );
}