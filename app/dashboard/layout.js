"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLogout } from "../hooks/useLogout";
import Image from "next/image";



import {
  Menu as MenuIcon,
  X as XIcon,
  Sun,
  Moon,
  UserCircle,
  Home,
  Settings,
  Package,
  User, ChevronDown,LogOut,Truck
} from "lucide-react";

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const logout = useLogout();

  /** Load Theme */
  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "dark") {
      //setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  /** Toggle Dark Mode */
  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    document.documentElement.classList.toggle("dark");
    localStorage.setItem("theme", newMode ? "dark" : "light");
  };

  /** Sidebar menu items */
  const menuItems = [
    { name: "Dashboard", href: "/dashboard", icon: <Home size={20} /> },
    { name: "Profile", href: "/dashboard/profile", icon: <User size={20} /> },
    { name: "Bookings", href: "/dashboard/myparcels", icon: <Package size={20} /> },
    { name: "BookParcel", href: "/dashboard/booking", icon: <Truck size={20} /> },
    { name: "Settings", href: "/dashboard/settings", icon: <Settings size={20} /> },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">

      {/* MOBILE BACKDROP */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed z-30 h-full bg-white dark:bg-gray-800 shadow-lg transition-all
          ${collapsed ? "w-16" : "w-64"}
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          {!collapsed && <h1 className="text-xl font-bold dark:text-white">Dashboard</h1>}

          {/* Collapse Button */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:block text-gray-700 dark:text-gray-300"
          >
            {collapsed ? "➡️" : "⬅️"}
          </button>

          {/* Mobile Close */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-700 dark:text-gray-300"
          >
            <XIcon className="h-6 w-6" />
          </button>
        </div>

        <nav className="p-3 space-y-2">
          {menuItems.map((item) => {
            const active = pathname === item.href;

            return (
              <Link href={item.href} key={item.name}>
                <div
                  className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition
                  ${active
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  <span className={active ? "text-white" : "stroke-gray-700 dark:stroke-gray-300"}>
                    {item.icon}
                  </span>

                  {!collapsed && <span>{item.name}</span>}
                </div>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1">

        {/* NAVBAR */}
        <header className="flex border-gray-200 items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
          {/* Mobile Menu */}
          <button
            className="lg:hidden text-gray-800 dark:text-gray-200"
            onClick={() => setSidebarOpen(true)}
          >
            <MenuIcon className="h-7 w-7" />
          </button>

          <h2 className="text-lg font-semibold dark:text-white">User Dashboard</h2>

          <div className="flex items-center gap-5">
            {/* Dark Mode 
            <button
              onClick={toggleTheme}
              className="text-gray-700 dark:text-gray-200"
            >
              {darkMode ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
            </button>
           */}
            {/* Profile Dropdown */}
            <div className="relative">
              <button
                className="flex items-center gap-2 text-gray-700 dark:text-gray-200"
                onClick={() => setProfileOpen(!profileOpen)}
              >
                
                <Image
                              height={8}
                              width={8}
                              src={session?.user?.profileImage || "/uploads/default-avatar.png"}
                              alt="avatar"
                              className="w-8 h-8 rounded-full object-cover border cursor-pointer"
                              
                            />
                <div className="text-black-300 text-xs">
                  {session?.user?.name}
                   <ChevronDown className="w-4 h-4 ml-2 float-right" />
                </div>
              </button>

              {profileOpen && (
                <div className="absolute z-1 right-0 mt-3 w-40 bg-white dark:bg-gray-700 shadow-md rounded-md p-2">
                  <Link
                    href="/dashboard/profile"
                    className="block p-2 py-1 my-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                  >
                    My Profile
                  </Link>
                  <Link href="#" onClick={logout}
                   className="block p-2 py-1 my-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                   ><LogOut className="w-4 h-4" />Logout
                   </Link>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}