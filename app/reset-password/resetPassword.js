"use client";
import { useState} from "react";
import { useSearchParams } from "next/navigation";

export default function ResetPassword() {
  const search = useSearchParams();
  const token = search.get("token");

  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
   const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password ,confirmPassword}),
    });

    const data = await res.json();
    setMessage(data.message);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Reset Password</h2>

        <form onSubmit={handleSubmit}>
          <label className="block mb-2 font-medium">New Password</label>
          <input
            type="password"
            className="w-full p-3 border rounded-lg mb-4"
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-required
          />

          {/* Confirm Password */}
  <label className="block mb-2 font-medium">Confirm Password</label>
  <input
    type="password"
    className="w-full p-3 border rounded-lg mb-4"
    placeholder="Confirm new password"
    value={confirmPassword}
    onChange={(e) => setConfirmPassword(e.target.value)}
    required
  />


          <button className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700">
            Reset Password
          </button>
        </form>

        {message && (
          <p className="mt-4 text-center text-blue-600">{message}</p>
        )}
      </div>
    </div>
  );
}
