"use client";
import React, { useState } from "react";

export const dynamic = "force-dynamic";
// Booking Component
export default function Booking() {
   const [form, setForm] = useState({
    senderName: "",
    receiverName: "",
    senderPhone: "",
    receiverPhone: "",
    senderAddress: "",
    receiverAddress: "",
    parcelType: "",
    weight: "",
    size: "",
    quantity: "",
  });

  const [status, setStatus] = useState({ loading: false, error: "", success: false,trackingId:"" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setStatus({ loading: true, error: "", success: false });

    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
     const result = await res.json();

     if (!res.ok || result.error) {
      throw new Error(result.error || "Failed to submit");
    }

   // On success
      if (result.success) {
        setStatus({ loading: false, error: "", success: true ,trackingId: result.trackingId});
        setForm({ senderName:"", receiverName:"", senderPhone:"", receiverPhone:"", senderAddress:"", receiverAddress:"", parcelType:"", weight:"" });
      }
    } catch (err) {
      setStatus({ loading: false, error: err?.message || "Something went wrong", success: false });
    }
  };

  return (
    
    <div className="max-w-5xl mx-auto p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl ring-1 ring-slate-200 my-10"  >
      <h2 className="text-2xl font-semibold text-slate-900 mb-3">Book a Parcel</h2>
      <p className="text-sm text-slate-500 mb-6">Fill in the details below to create a parcel booking.</p>
      {status.error && (
        <p className="mb-4 text-red-600 bg-red-50 p-3 rounded-lg text-sm">{status.error}</p>
      )}

      {status.success && (
        <p className="mb-4 text-green-700 bg-green-50 p-3 rounded-lg text-sm">Booking successful! Your tracking ID is: {status.trackingId}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex flex-col">
            <span className="text-xs font-medium text-slate-600">Sender Name</span>
            <input
              name="senderName"
              value={form.senderName}
              onChange={handleChange}
              required
              className="mt-1 px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-400 transition"
              placeholder="e.g. John Doe"
            />
          </label>

          <label className="flex flex-col">
            <span className="text-xs font-medium text-slate-600">Receiver Name</span>
            <input
              name="receiverName"
              value={form.receiverName}
              onChange={handleChange}
              required
              className="mt-1 px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-400 transition"
              placeholder="e.g. Jane Smith"
            />
          </label>

          <label className="flex flex-col">
            <span className="text-xs font-medium text-slate-600">Sender Phone</span>
            <input
              name="senderPhone"
              value={form.senderPhone}
              onChange={handleChange}
              required
              inputMode="tel"
              pattern="[0-9+\-() ]{7,}"
              className="mt-1 px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-400 transition"
              placeholder="+91 98765 43210"
            />
          </label>

          <label className="flex flex-col">
            <span className="text-xs font-medium text-slate-600">Receiver Phone</span>
            <input
              name="receiverPhone"
              value={form.receiverPhone}
              onChange={handleChange}
              required
              inputMode="tel"
              pattern="[0-9+\-() ]{7,}"
              className="mt-1 px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-400 transition"
              placeholder="+91 91234 56789"
            />
          </label>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <label className="flex flex-col">
            <span className="text-xs font-medium text-slate-600">Sender Address</span>
            <textarea
              name="senderAddress"
              value={form.senderAddress}
              onChange={handleChange}
              required
              rows={3}
              className="mt-1 px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-400 transition resize-none"
              placeholder="Street, City, State, PIN"
            />
          </label>

          <label className="flex flex-col">
            <span className="text-xs font-medium text-slate-600">Receiver Address</span>
            <textarea
              name="receiverAddress"
              value={form.receiverAddress}
              onChange={handleChange}
              required
              rows={3}
              className="mt-1 px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-400 transition resize-none"
              placeholder="Street, City, State, PIN"
            />
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label className="flex flex-col md:col-span-2">
            <span className="text-xs font-medium text-slate-600">Parcel Type</span>
            <select
              name="parcelType"
              value={form.parcelType}
              onChange={handleChange}
              required
              className="mt-1 px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-400 transition"
            >
              <option value="">Select type</option>
              <option value="document">Document</option>
              <option value="electronics">Electronics</option>
              <option value="clothing">Clothing</option>
              <option value="other">Other</option>
            </select>
          </label>

          <label className="flex flex-col">
            <span className="text-xs font-medium text-slate-600">Weight (kg)</span>
            <input
              name="weight"
              value={form.weight}
              onChange={handleChange}
              type="number"
              min="0"
              step="0.01"
              className="mt-1 px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-400 transition"
              placeholder="0.5"
            />
          </label>
        </div>

        <div className="flex items-center justify-between gap-4">
          <button
            type="submit"
            disabled={status.loading}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-sky-600 text-white font-medium shadow hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-400 transition"
          >
            {status.loading ? (
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" className="opacity-75" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
            <span>{status.loading ? "Submitting..." : "Submit"}</span>
          </button>

          <button
            type="button"
            onClick={() => setForm({
              senderName: "",
              receiverName: "",
              senderPhone: "",
              receiverPhone: "",
              senderAddress: "",
              receiverAddress: "",
              parcelType: "",
              weight: "",
            })}
            className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 focus:outline-none transition"
          >
            Reset
          </button>
        </div>
      </form>

      <p className="mt-4 text-xs text-slate-400">We respect your privacy. Your details are used only for booking.</p>
    </div>
  );
}
