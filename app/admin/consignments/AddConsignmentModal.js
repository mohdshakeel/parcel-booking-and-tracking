"use client";
import { X, Truck, MapPin, Package } from "lucide-react";
import { useEffect, useState } from "react";

export default function AddConsignmentModal({ onClose, onSuccess }) {
  const [hubs, setHubs] = useState([]);
  const [sourceHub, setSourceHub] = useState("");
  const [destinationHub, setDestinationHub] = useState("");
  const [parcels, setParcels] = useState([]);
  const [selected, setSelected] = useState([]);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setError] = useState("");
  const [successMsg, setSuccess] = useState("");

  /* Load hubs */
  useEffect(() => {
    fetch("/api/hubs?dropdown=true")
      .then((r) => r.json())
      .then((data) => setHubs(data.hubs || []));
  }, []);

  /* Load parcels when source hub changes */
  useEffect(() => {
    if (!sourceHub) return;

    fetch(`/api/admin/parcels/hubId/${sourceHub}`)
      .then((r) => r.json())
      .then((data) => setParcels(data.parcels ?? data))
      .catch(() => setParcels([]));
  }, [sourceHub]);

  const toggleParcel = (id) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((p) => p !== id)
        : [...prev, id]
    );
  };

  const createConsignment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/admin/consignments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceHub,
          destinationHub,
          parcelIds: selected,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to create consignment");
      }

      setSuccess("Consignment created successfully.");
      onSuccess?.(data);

      setTimeout(() => onClose(), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-3xl rounded-xl bg-white shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Create Consignment
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        </div>

        {/* Alerts */}
        {successMsg && (
          <div className="m-4 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            ✅ {successMsg}
          </div>
        )}

        {errorMsg && (
          <div className="m-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            ❌ {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={createConsignment} className="space-y-4 px-6 py-5">

          {/* Source Hub */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Source Hub *
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <select
                value={sourceHub}
                onChange={(e) => {
                  setSourceHub(e.target.value);
                  setSelected([]);
                }}
                required
                className="w-full rounded-lg border border-gray-300 pl-10 py-2 text-sm"
              >
                <option value="">Select Source Hub</option>
                {hubs.map((h) => (
                  <option key={h._id} value={h._id}>
                    {h.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Destination Hub */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Destination Hub *
            </label>
            <div className="relative">
              <Truck className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <select
                value={destinationHub}
                onChange={(e) => setDestinationHub(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 pl-10 py-2 text-sm"
              >
                <option value="">Select Destination Hub</option>
                {hubs
                  .filter((h) => h._id !== sourceHub)
                  .map((h) => (
                    <option key={h._id} value={h._id}>
                      {h.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Parcels */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Select Parcels *
            </label>

            <div className="max-h-60 space-y-2 overflow-y-auto rounded-lg border p-3">
              {parcels.length === 0 && (
                <p className="text-sm text-gray-500">
                  No parcels available for this hub
                </p>
              )}

              {parcels.map((p) => (
                <label
                  key={p._id}
                  className="flex cursor-pointer items-center gap-2 rounded p-2 hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(p._id)}
                    onChange={() => toggleParcel(p._id)}
                  />
                  <Package size={14} className="text-gray-400" />
                  <span className="text-sm">{p.trackingId}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-100"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                loading ||
                !sourceHub ||
                !destinationHub ||
                selected.length === 0
              }
              className="rounded-lg bg-indigo-600 px-5 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Consignment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
