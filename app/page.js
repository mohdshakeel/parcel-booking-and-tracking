export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-700 p-6">
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-10 max-w-lg w-full text-center text-white">
        
        <h1 className="text-4xl font-extrabold mb-4">
          Parcel Booking & Tracking
        </h1>

        <p className="text-lg text-gray-200 mb-8">
          Welcome! Choose an option below to continue.
        </p>

        <div className="flex flex-col gap-4">
          <a
            href="/booking"
            className="w-full bg-white text-blue-700 font-semibold py-3 rounded-xl shadow hover:bg-gray-100 transition"
          >
            📦 Book a Parcel
          </a>

          <a
            href="/tracking"
            className="w-full bg-blue-500 text-white font-semibold py-3 rounded-xl shadow hover:bg-blue-600 transition"
          >
            🔍 Track Parcel
          </a>
        </div>
      </div>
    </main>
  );
}
