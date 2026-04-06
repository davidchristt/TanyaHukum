export default function ChatArea() {
  return (
    <div className="h-full bg-white/80 backdrop-blur-md rounded-2xl shadow-lg flex flex-col">
      
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-200">
        
        <div className="flex items-center gap-2">
          <img src="/logo.png" className="w-6 h-6" />
          <h1 className="font-semibold text-gray-900">TanyaHukum</h1>
        </div>

        <button className="bg-blue-600 hover:bg-blue-700 transition 
        text-white px-4 py-1.5 rounded-lg text-sm flex items-center gap-2 shadow-md">
          <img src="/icons/bintangPro.svg" className="w-4 h-4" />
          Konsultasi Pro
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        
        <h1 className="text-4xl font-semibold text-gray-900 mb-2 text-center">
          Halo Sobat Indonesia!!
        </h1>

        <p className="text-gray-600 mb-6 text-center">
          Mau Tanya Hukum Apa Hari Ini??
        </p>

        {/* Input */}
        <div className="w-full max-w-xl flex border border-blue-200 rounded-xl overflow-hidden 
        focus-within:ring-2 focus-within:ring-blue-400">

          <input
            type="text"
            placeholder="Ketik Pertanyaan Hukum Anda di sini..."
            className="flex-1 px-4 py-3 outline-none text-gray-800 placeholder-gray-400 bg-transparent"
          />

          <button className="px-4 flex items-center">
            <img src="/icons/sendChat.svg" className="w-5 h-5" />
          </button>
        </div>

      </div>
    </div>
  );
}