"use client";

import Link from "next/link";
import { Home, BarChart3, Settings, LogOut } from "lucide-react";
import { useDispatch } from "react-redux";
import { logout } from "@/lib/redux/slices/authSlice";
import { useRouter } from "next/navigation";

export default function Sidebar({ open }) {
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogout = () => {
    dispatch(logout());
    router.push("/login");
  };

  const nav = [
    { name: "Dashboard", icon: Home, href: "/dashboard" },
    { name: "Analytics", icon: BarChart3, href: "/dashboard/analytics" },
    { name: "Settings", icon: Settings, href: "/dashboard/settings" },
  ];

  return (
    <aside
      className={`bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 ${
        open ? "w-64" : "w-20"
      }`}
    >
      <div className="p-4 text-xl font-bold">🚀 App</div>

      <nav className="mt-6 space-y-2">
        {nav.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <item.icon size={20} />
            {open && <span>{item.name}</span>}
          </Link>
        ))}
      </nav>

      <button
        onClick={handleLogout}
        className="absolute bottom-5 left-4 flex items-center gap-2 text-red-500"
      >
        <LogOut size={20} />
        {open && "Logout"}
      </button>
    </aside>
  );
}