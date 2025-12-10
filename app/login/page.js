"use client";
import { useState,useEffect } from "react";
import Link from "next/link";
import { useSession, signIn} from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  //const session = useSession();
  const [msg, setMsg] = useState("");
  const { status } = useSession();

  useEffect(() => {
  if (status === "authenticated") {
    router.push("/dashboard/profile");
  }
}, [status,router]);

  
  

  async function handleLogin(e) {
  e.preventDefault();

  const form = new FormData(e.target);
  const data = Object.fromEntries(form.entries());

  // Use NextAuth signIn()
  const result = await signIn("credentials", {
    email: data.email,
    password: data.password,
    redirect: false, 
    //callbackUrl: "/dashboard/profile",
  });

  if (!result?.error) {
    // SUCCESS
    router.push("/dashboard/profile");
    setMsg('You are successfully logged in!');
  } else {
    // ERROR from NextAuth
    setMsg(result.error || "Invalid email or password");
  }
}


  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8">
        
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Login Account
        </h1>

        <form onSubmit={handleLogin} className="space-y-5">

          

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
            Login
          </button>
        </form>

        <p className="text-center text-gray-500 mt-6 text-sm">
          Not have an account?{" "}
          <Link href="/register" className="text-blue-600 font-medium hover:underline">
            Register 
          </Link> 
           &nbsp; | {" "}
          <Link href="/forgot-password" className="text-blue-600 font-medium hover:underline">
            Forgot Password
          </Link>
        </p>

        {/* Message */}
        {msg && (
          <p
            className={`mt-4 text-center text-sm ${
              msg.includes("success") ? "text-green-600" : "text-red-600"
            }`}
          >
            {msg}
          </p>
        )}
      </div>
    </div>
  );
}
