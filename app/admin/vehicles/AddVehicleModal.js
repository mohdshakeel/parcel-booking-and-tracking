"use client";
import { X, Truck } from "lucide-react";
import { useEffect, useState } from "react";

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none";

const labelClass =
  "text-xs font-medium text-gray-600 mb-1";

export default function AddVehicleModal({ onClose }) {
  const [drivers, setDrivers] = useState([]);
  const [form, setForm] = useState({});

  useEffect(() => {
    const loadDrivers = async () => {
      try {
        const res = await fetch("/api/drivers");
        const data = await res.json();
        setDrivers(Array.isArray(data) ? data : data.drivers || []);
      } catch {
        setDrivers([]);
      }
    };
    loadDrivers();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm(prev => ({ ...prev, [name]: files ? files[0] : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));

    const res = await fetch("/api/vehicles", {
      method: "POST",
      body: fd
    });

    if (res.ok) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-xl relative">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-2">
            <Truck className="text-blue-600" />
            <h2 className="text-lg font-semibold">Add Vehicle</h2>
          </div>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">

          {/* VEHICLE DETAILS */}
          <section>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Vehicle Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Vehicle Number</label>
                <input name="vehicleNumber" required onChange={handleChange} className={inputClass} />
              </div>

              <div>
                <label className={labelClass}>Vehicle Type</label>
                <select name="vehicleType" required onChange={handleChange} className={inputClass}>
                  <option value="">Select</option>
                  <option>Bike</option>
                  <option>Van</option>
                  <option>Truck</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Capacity (kg)</label>
                <input name="capacityKg" onChange={handleChange} className={inputClass} />
              </div>
            </div>
          </section>

          {/* BRAND */}
          <section>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Brand & Model
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input name="brand" placeholder="Brand" onChange={handleChange} className={inputClass} />
              <input name="model" placeholder="Model" onChange={handleChange} className={inputClass} />
              <input name="color" placeholder="Color" onChange={handleChange} className={inputClass} />
              <input name="year" type="number" placeholder="Year" onChange={handleChange} className={inputClass} />
            </div>
          </section>

          {/* DRIVER */}
          <section>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Assign Driver
            </h3>

            <select name="driverId" required onChange={handleChange} className={inputClass}>
              <option value="">Select Driver</option>
              {drivers.map(d => (
                <option key={d._id} value={d._id}>
                  {d.name} ({d.phone})
                </option>
              ))}
            </select>
          </section>

          {/* DOCUMENTS */}
          <section>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Documents
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input name="regNumber" placeholder="Registration No" onChange={handleChange} className={inputClass} />
              <input type="date" name="regExpiry" onChange={handleChange} className={inputClass} />
              <input type="file" name="regDoc" onChange={handleChange} className={inputClass} />

              <input name="pucNumber" placeholder="PUC No" onChange={handleChange} className={inputClass} />
              <input type="date" name="pucExpiry" onChange={handleChange} className={inputClass} />
              <input type="file" name="pucDoc" onChange={handleChange} className={inputClass} />

              <input name="insProvider" placeholder="Insurance Provider" onChange={handleChange} className={inputClass} />
              <input name="policyNumber" placeholder="Policy No" onChange={handleChange} className={inputClass} />
              <input type="date" name="insExpiry" onChange={handleChange} className={inputClass} />
            </div>
          </section>

          {/* ACTIONS */}
          <div className="flex justify-end gap-3 border-t pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border">
              Cancel
            </button>
            <button type="submit" className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
              Save Vehicle
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
