"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState("loading"); // loading | success | error
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link.");
      return;
    }

    fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Verification failed");
        }

        setStatus("success");
        setMessage(data.message || "Email verified successfully!");
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err.message);
      });
  }, [token]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 text-center shadow">
        
        {/* Loading */}
        {status === "loading" && (
          <p className="text-lg text-gray-600">
            Verifying your email...
          </p>
        )}

        {/* Success */}
        {status === "success" && (
          <>
            <h2 className="mb-2 text-xl font-semibold text-green-600">
              ✅ Email Verified
            </h2>
            <p className="mb-4 text-gray-600">{message}</p>

            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              Go to Login
            </Link>
          </>
        )}

        {/* Error */}
        {status === "error" && (
          <>
            <h2 className="mb-2 text-xl font-semibold text-red-600">
              ❌ Verification Failed
            </h2>
            <p className="mb-4 text-gray-600">{message}</p>

            <Link
              href="/login"
              className="text-sm font-medium text-gray-900 underline"
            >
              Go to Login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
