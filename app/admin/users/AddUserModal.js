"use client";
import { X, User, Mail, Phone, MapPin } from "lucide-react";
import { useState,useEffect} from "react";
import { Country, State, City } from "country-state-city";

/*const EU_COUNTRY_CODES = [
  "AT","BE","BG","HR","CY","CZ","DK","EE","FI","FR",
  "DE","GR","HU","IE","IT","LV","LT","LU","MT","NL",
  "PL","PT","RO","SK","SI","ES","SE"
];
*/

const EU_COUNTRY_CODES = ["IE", "DE", "FR", "IT"];

const ZIP_LOOKUP_SUPPORTED = ["IE", "FR"];
const CITY_DROPDOWN_SUPPORTED = ["DE", "IT"];


export default function AddCustomerModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
  });
const [countries] = useState(Country.getAllCountries());
const [states, setStates] = useState([]);
const [cities, setCities] = useState([]);
const [loading, setLoading] = useState(false);
const [errorMsg, setError] = useState("");
const [successMsg, setSuccess] = useState("");




const handleCountryChange = (e) => {
  const countryCode = e.target.value;
  setForm({ ...form, country: countryCode, state: "", city: "" });

  setStates(State.getStatesOfCountry(countryCode));
  setCities([]);
};

const handleStateChange = (e) => {
  const stateCode = e.target.value;
  setForm({ ...form, state: stateCode, city: "" });

  setCities(City.getCitiesOfState(form.country, stateCode));
};


  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/users/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          address: {
            street: form.street,
            city: form.city,
            state: form.state,
            zipcode: form.zipcode,
            country: form.country,
          },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      setSuccess("Customer created successfully. Login details sent by email.");
      onSuccess?.(data);

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

 
        

  useEffect(() => {
  if (
    ZIP_LOOKUP_SUPPORTED.includes(form.country) &&
    form.zipcode.length >= 4
  ) {
    fetch(`https://api.zippopotam.us/${form.country.toLowerCase()}/${form.zipcode}`)
      .then((res) => {
        if (!res.ok) throw new Error("Invalid ZIP");
        return res.json();
      })
      .then((data) => {
        const place = data.places?.[0];

        setForm((prev) => ({
          ...prev,
          city: place["place name"] || prev.city,
          state: place["state abbreviation"] || prev.state,
        }));
      })
      .catch(() => {
        // Silent fail – manual entry fallback
      });
  }
}, [form.zipcode, form.country]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-xl bg-white shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Add New Customer
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        </div>
{successMsg && (
  <div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-700 border border-green-200">
    ✅ {successMsg}
  </div>
)}

{errorMsg && (
  <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">
    ❌ {errorMsg}
  </div>
)}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">

          {/* Name */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                name="name"
                required
                value={form.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full rounded-lg border border-gray-300 pl-10 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Email + Phone */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  className="w-full rounded-lg border border-gray-300 pl-10 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Phone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="tel"
                  name="phone"
                  required
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  className="w-full rounded-lg border border-gray-300 pl-10 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Street */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Street Address
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                name="street"
                required
                value={form.street}
                onChange={handleChange}
                placeholder="House no, Street name"
                className="w-full rounded-lg border border-gray-300 pl-10 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Country */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Country
            </label>
            <select
                name="country"
                required
                value={form.country}
                onChange={handleCountryChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                >
                <option value="">Select Country</option>
                {countries
    .filter((c) => EU_COUNTRY_CODES.includes(c.isoCode))
    .map((country) => (
      <option key={country.name} value={country.isoCode}>
        {country.name}
      </option>
    ))}
            </select>

          </div>

          {/* City / State / Zip */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                State / Region / Province
              </label>
              <select
                    name="state"
                    required
                    value={form.state}
                    onChange={handleStateChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    >
                    <option value="">Select State / Region</option>
                    {states.map((state) => (
                        <option key={state.name} value={state.isoCode}>
                        {state.name}
                        </option>
                    ))}
                </select>

            </div>


            {/* City */}
<div>
  <label className="mb-1 block text-sm font-medium text-gray-700">
    City
  </label>

  {CITY_DROPDOWN_SUPPORTED.includes(form.country) ? (
    <select
      name="city"
      value={form.city}
      onChange={(e) =>
        setForm({ ...form, city: e.target.value })
      }
      className="w-full rounded-lg border px-3 py-2 text-sm"
    >
      <option value="">Select City</option>
      {cities.map((city) => (
        <option key={city.name} value={city.name}>
          {city.name}
        </option>
      ))}
    </select>
  ) : (
    <input
      type="text"
      name="city"
      value={form.city}
      onChange={(e) =>
        setForm({ ...form, city: e.target.value })
      }
      placeholder="Enter city"
      className="w-full rounded-lg border px-3 py-2 text-sm"
    />
  )}
</div>


            

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Zip Code
              </label>
              <input
                type="text"
                name="zipcode"
                required
                value={form.zipcode}
                onChange={handleChange}
                placeholder="400001"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
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
              disabled={loading}
              className="rounded-lg bg-indigo-600 px-5 py-2 text-white hover:bg-indigo-700"
            >
              {loading ? "Creating..." : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
