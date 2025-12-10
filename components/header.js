"use client";
import Link from "next/link";
import { useState } from "react";
import { usePathname} from "next/navigation";
import { useSession} from "next-auth/react";
import { useLogout } from "@/app/hooks/useLogout";
export default function Header() {
  const [open, setOpen] = useState(false);
  const { data:session,status } = useSession();
  const pathname = usePathname();
  console.log("Header session data:", session);
  //console.log("Header isLoggedIn status:", status);
  
const logout = useLogout();

   const hideHeader = pathname?.startsWith("/dashboard");

if (hideHeader) {
  return null; // Hide header for all routes starting with /dashboard
}

return (
  <header className="border-b bg-white border-gray-200 shadow-sm sticky top-0 z-30">
      <div className="max-w-6xl mx-auto flex items-center justify-between py-4 px-4">

        <div className="text-lg font-semibold">
          Parcel Booking
        </div>

        {/* Desktop Menu */}
        <nav className="hidden md:flex gap-6 text-sm">
          <NavLinks isLoggedIn={status} handleLogout={logout} />
        </nav>

        {/* Mobile */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 border rounded-md"
        >
          {open ? "✕" : "☰"}
        </button>

        {open && (
          <div className="absolute top-16 left-0 w-full bg-white border-b shadow-md md:hidden">
            <nav className="flex flex-col text-sm px-4 py-4 space-y-3">
              <NavLinks isLoggedIn={isLoggedIn} />
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

function NavLinks({isLoggedIn,handleLogout}) {
  //console.log("isLoggedIn in NavLinks:", isLoggedIn.authenticated);
  return (
    <>
      <Link href="/" className="hover:text-blue-600">Home</Link>
      <Link href="/contact" className="hover:text-blue-600">Contact</Link>
      <Link href="/tracking" className="hover:text-blue-600">Booking Track</Link>
      {/* 🔥 Show Login if NOT logged in */}
          {isLoggedIn==='unauthenticated' && (
            <Link 
              href="/login"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Login
            </Link>
          )}

          {/* 🔥 Show Logout if logged in */}
          {isLoggedIn==='authenticated' && (
            
              <button onClick={handleLogout}
                
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Logout
              </button>
            
          )}
    </>
  );
}