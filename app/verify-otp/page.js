"use client";
import { useState } from "react";

export default function VerifyOTP() {
  const [email, setEmail] = useState("");
  const [otp, setOTP] = useState("");
  const [message, setMessage] = useState("");

  const verifyOtp = async (e) => {
    e.preventDefault();

    const res = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });

    const data = await res.json();
    setMessage(data.message);

    if (res.status === 200) {
      window.location.href = "/dashboard";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">

        <h2 className="text-2xl font-bold text-center mb-6">Verify OTP</h2>

        <form onSubmit={verifyOtp}>
          <label className="block mb-2 font-medium ">Email</label>
          <input
            className="w-full p-3 border rounded-lg mb-4"
            type="email"
            placeholder="Enter email again"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label className="block mb-2 font-medium">OTP</label>
          <input
            className="w-full p-3 border rounded-lg mb-4"
            type="text"
            placeholder="6-digit OTP"
            value={otp}
            onChange={(e) => setOTP(e.target.value)}
          />

          <button className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700">
            Verify OTP
          </button>
        </form>

        {message && (
          <p className="mt-4 text-center text-blue-600">{message}</p>
        )}
      </div>
    </div>
  );
}
