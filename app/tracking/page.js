"use client";
import { useState } from "react";

export default function TrackParcelPage() {
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState({ loading: false, error: "" });

  async function submitForm(e) {
    e.preventDefault();
    setStatus({ loading: true, error: "" });
    setResult(null);

    const form = new FormData(e.target);
    const trackingId = form.get("trackingId");

    try {
      const res = await fetch("/api/track", {
        method: "POST",
        body: JSON.stringify({ trackingId }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || "Tracking failed");
      }

      setResult(data);
      setStatus({ loading: false, error: "" });
    } catch (err) {
      setStatus({ loading: false, error: err.message });
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8">
        
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Track Parcel
        </h1>

        {status.error && (
          <p className="mb-4 text-red-600 bg-red-50 p-3 rounded-lg text-sm">
            {status.error}
          </p>
        )}

        <form onSubmit={submitForm} className="space-y-5">

          <div>
            <label className="block mb-1 font-medium text-gray-700">Tracking ID</label>
            <input
              name="trackingId"
              type="text"
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Enter Tracking ID"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all"
          >
            {status.loading ? "Tracking..." : "Track"}
          </button>

        </form>

        {result && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg text-sm overflow-auto">
            <pre className="text-gray-700 whitespace-pre-wrap">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

      </div>
    </div>
  );
}
