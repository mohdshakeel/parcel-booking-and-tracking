"use client";
import { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  
  const [status, setStatus] = useState({ loading: false, error: "", success: false });

  async function handleRegister(e) {
    e.preventDefault();
    setStatus({ loading: true, error: "", success: false });
    const form = new FormData(e.target);
    const data = Object.fromEntries(form.entries());
     
    try{
    const res = await fetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });

    const result = await res.json();
    
    if (!res.ok || result.error) {
      throw new Error(result.error || result.message+"! Failed to submit");
    }
    
    if (result.success) {
        setStatus({ loading: false, error: "", success: true});
    }

    } catch (error) {
      setStatus({ loading: false, error: error?.message || "Something went wrong", success: false });
    }
  }


  return (
    <div className="min-h-screen flex items-center justify-center  px-4 ">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8 my-10">
        
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Create Account
        </h1>

      {status.error && (
        <p className="mb-4 text-red-600 bg-red-50 p-3 rounded-lg text-sm">{status.error}</p>
      )}

      {status.success && (
        <p className="mb-4 text-green-700 bg-green-50 p-3 rounded-lg text-sm">User Registered successfully! A verification email has been sent to verify account.</p>
      )}

        <form onSubmit={handleRegister} className="space-y-5">

          {/* Name */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">Full Name</label>
            <input
              name="name"
              type="text"
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="John Doe"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">Email</label>
            <input
              name="email"
              type="email"
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="example@email.com"
            />
          </div>

           {/* Phone */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">Phone</label>
            <input
              name="phone"
              type="tel"
              inputMode="tel"
              pattern="[0-9+\-() ]{7,}"
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="+91 98765 43210"
            />
          </div>


          {/* Password */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">Password</label>
            <input
              name="password"
              type="password"
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="••••••••"
            />
          </div>

         
          {/* Button */}
          <button
            type="submit"
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all"
          >
            Register
          </button>
        </form>
        <p className="text-center text-gray-500 mt-6 text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 font-medium hover:underline">
            Login
          </Link>
        </p>

              </div>
    </div>
  );


}
