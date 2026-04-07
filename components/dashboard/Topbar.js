"use client";

import { Menu, Sun, Moon } from "lucide-react";
import { useState } from "react";
import { useSelector } from "react-redux";

export default function Topbar({ setOpen }) {
  const [dark, setDark] = useState(false);
  const { user } = useSelector((state) => state.auth);

  const toggleTheme = () => {
    setDark(!dark);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-800 shadow">
      <button onClick={() => setOpen((prev) => !prev)}>
        <Menu />
      </button>

      <div className="flex items-center gap-4">
        <button onClick={toggleTheme}>
          {dark ? <Sun /> : <Moon />}
        </button>

        <div className="text-sm font-medium">
          {user?.name || "User"}
        </div>
      </div>
    </header>
  );
}