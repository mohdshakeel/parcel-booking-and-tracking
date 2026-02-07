"use client";
import { X, Truck } from "lucide-react";
import { useEffect, useState } from "react";

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none";

const labelClass = "text-xs font-medium text-gray-600 mb-1";

export default function VehicleModal({ vehicle, onClose, onSuccess }) {
    
  const isEdit = Boolean(vehicle?._id);

  const [drivers, setDrivers] = useState([]);
  const [form, setForm] = useState({
    vehicleNumber: "",
    vehicleType: "",
    capacityKg: "",
    brand: "",
    model: "",
    color: "",
    year: "",
    driverId: "",
    regNumber: "",
  policyNumber: "",
  pucNumber: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* Prefill form on edit */
  useEffect(() => {
    if (vehicle) {
      setForm({
      vehicleNumber: vehicle.vehicleNumber || "",
      vehicleType: vehicle.vehicleType || "",
      capacityKg: vehicle.capacityKg || "",
      brand: vehicle.brand || "",
      model: vehicle.model || "",
      color: vehicle.color || "",
      year: vehicle.year || "",
      driverId: vehicle.driverId?._id || vehicle.driverId || "",

      regNumber: vehicle.registration?.rcNumber || "",
      policyNumber: vehicle.insurance?.policyNumber || "",
      pucNumber: vehicle.pollution?.pucNumber || "",
    });
    }
  }, [isEdit, vehicle]);

  /* Load drivers */
  useEffect(() => {
    const loadDrivers = async () => {
      const res = await fetch("/api/drivers/");
      const data = await res.json();
      setDrivers(data.drivers || []);
    };
    loadDrivers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const isMultipart = !isEdit;
    let body;
    let headers = {};

    if (isMultipart) {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      body = fd;
    } else {
      const payload = {
  vehicleNumber: form.vehicleNumber,
  vehicleType: form.vehicleType,
  capacityKg: form.capacityKg,
  brand: form.brand,
  model: form.model,
  color: form.color,
  year: form.year,
  driverId: form.driverId,

  registration: { rcNumber: form.regNumber },
  insurance: { policyNumber: form.policyNumber },
  pollution: { pucNumber: form.pucNumber },
};

     body = JSON.stringify(payload);
       headers["Content-Type"] = "application/json";

    }

    const res = await fetch(
      isEdit ? `/api/vehicles/${vehicle._id}` : "/api/vehicles/create",
      {
        method: isEdit ? "PUT" : "POST",
        headers,
        body,
      }
    );

    const data = await res.json();
    setLoading(false);

    if (!data.success) {
      setError(data.message || "Something went wrong");
      return;
    }

    setSuccess(isEdit ? "Vehicle updated successfully" : "Vehicle added successfully");
    onSuccess?.();
    setTimeout(onClose, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-2">
            <Truck className="text-blue-600" />
            <h2 className="text-lg font-semibold">
              {isEdit ? "Update Vehicle" : "Add Vehicle"}
            </h2>
          </div>
          <button onClick={onClose}><X /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">

          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-green-600">{success}</p>}

          {/* Vehicle Info */}
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Vehicle Number</label>
              <input
                name="vehicleNumber"
                value={form.vehicleNumber}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Vehicle Type</label>
              <select
                name="vehicleType"
                value={form.vehicleType}
                onChange={handleChange}
                required
                className={inputClass}
              >
                <option value="">Select</option>
                <option>Bike</option>
                <option>Van</option>
                <option>Truck</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>Capacity (kg)</label>
              <input
                name="capacityKg"
                value={form.capacityKg}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
          </div>

          {/* Brand */}
          <div className="grid md:grid-cols-4 gap-4">
            {["brand", "model", "color", "year"].map((f) => (
              <input
                key={f}
                name={f}
                placeholder={f.charAt(0).toUpperCase() + f.slice(1)}
                value={form[f]}
                onChange={handleChange}
                className={inputClass}
              />
            ))}
          </div>

          {/* Driver */}
          <select
            name="driverId"
            value={form.driverId}
            onChange={handleChange}
            className={inputClass}
          >
            <option value="">Select Driver</option>
            {drivers.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name} ({d.phone})
              </option>
            ))}
          </select>

          {/* Documents */}
          {/* Documents */}
<div className="grid md:grid-cols-3 gap-4">
  <input
    name="regNumber"
    placeholder="RC No"
    value={form.regNumber}
    onChange={handleChange}
    className={inputClass}
  />

  <input
    name="pucNumber"
    placeholder="PUC No"
    value={form.pucNumber}
    onChange={handleChange}
    className={inputClass}
  />

  <input
    name="policyNumber"
    placeholder="Policy No"
    value={form.policyNumber}
    onChange={handleChange}
    className={inputClass}
  />
</div>


          <div className="flex justify-end gap-3 border-t pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg">
              Cancel
            </button>
            <button disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded-lg">
              {loading ? "Saving..." : isEdit ? "Update Vehicle" : "Save Vehicle"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
