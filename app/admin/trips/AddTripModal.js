"use client";
import { X, Truck, MapPin, Package } from "lucide-react";
import { useEffect, useState } from "react";

export default function AddTripModal({ onClose, onSuccess }) {
  const [hubs, setHubs] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [consignments, setConsignments] = useState([]);

  const [sourceHub, setSourceHub] = useState("");
  const [driverId, setDriverId] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [selectedConsignments, setSelectedConsignments] = useState([]);
  const [errorMsg, setError] = useState("");
  const [successMsg, setSuccess] = useState("");
  
  const [loading, setLoading] = useState(false);

  /* -----------------------------
     Initial Load
  ------------------------------*/
  useEffect(() => {
    fetch("/api/hubs?dropdown=true")
      .then(res => res.json())
      .then(res => setHubs(res.hubs || []));

    fetch("/api/drivers?available=true")
      .then(res => res.json())
      .then(res => setDrivers(res.data || []));

    fetch("/api/vehicles?available=true")
      .then(res => res.json())
      .then(res => setVehicles(res.data || []));
  }, []);

  /* -----------------------------
     Load consignments by hub
  ------------------------------*/
  useEffect(() => {
    if (!sourceHub) return;

    fetch(`/api/consignments?hubId=${sourceHub}&unassigned=true`)
      .then(res => res.json())
      .then(res => setConsignments(res.data || []));
  }, [sourceHub]);

  /* -----------------------------
     Select Consignment
  ------------------------------*/
  const toggleConsignment = (id) => {
    setSelectedConsignments(prev =>
      prev.includes(id)
        ? prev.filter(c => c !== id)
        : [...prev, id]
    );
  };

  /* -----------------------------
     Create Trip
  ------------------------------*/
  const createTrip = async () => {
    if (!sourceHub || !driverId || !vehicleId || !selectedConsignments.length) {
      alert("Please fill all fields");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    const res = await fetch("/api/trips/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sourceHub,
        driverId,
        vehicleId,
        consignmentIds: selectedConsignments,
      }),
    });

    setLoading(false);

    if (res.ok) {
      setSuccessMsg("Trip created successfully");
      setSelectedConsignments([]);
    } else {
      setErrroMsg("Failed to create trip");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-3xl rounded-xl bg-white shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Create Trip
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
        <form onSubmit={createTrip} className="space-y-4 px-6 py-5">

           {/* Hub */}
      <div>
        <label className="block text-sm font-medium">Source Hub</label>
        <select
          className="w-full border rounded px-3 py-2"
          value={sourceHub}
          onChange={(e) => setSourceHub(e.target.value)}
        >
          <option value="">Select Hub</option>
          {hubs.map(h => (
            <option key={h._id} value={h._id}>
              {h.name}
            </option>
          ))}
        </select>
      </div>

      {/* Driver + Vehicle */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Driver</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={driverId}
            onChange={(e) => setDriverId(e.target.value)}
          >
            <option value="">Select Driver</option>
            {drivers.map(d => (
              <option key={d._id} value={d._id}>
                {d.name} ({d.phone})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Vehicle</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={vehicleId}
            onChange={(e) => setVehicleId(e.target.value)}
          >
            <option value="">Select Vehicle</option>
            {vehicles.map(v => (
              <option key={v._id} value={v._id}>
                {v.vehicleNumber} • {v.type}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Consignments */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Available Consignments
        </label>

        <div className="border rounded p-4 max-h-72 overflow-y-auto space-y-2">
          {consignments.length === 0 && (
            <p className="text-sm text-gray-500">
              No consignments available
            </p>
          )}

          {consignments.map(c => (
            <label
              key={c._id}
              className="flex items-center gap-3 border p-2 rounded cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedConsignments.includes(c._id)}
                onChange={() => toggleConsignment(c._id)}
              />
              <div>
                <p className="font-medium">
                  {c.consignmentNumber}
                </p>
                <p className="text-xs text-gray-500">
                  {c.parcels.length} parcels
                </p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Submit */}
      <button
        onClick={createTrip}
        disabled={loading}
        className="bg-black text-white px-6 py-2 rounded w-full"
      >
        {loading ? "Creating Trip..." : "Create Trip"}
      </button>
    </form>
          </div>
        </div>
      
  );
}
