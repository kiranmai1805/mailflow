import { Bell, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    setDarkMode(
      document.documentElement.classList.contains("dark")
    );
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;

    if (root.classList.contains("dark")) {
      root.classList.remove("dark");
      localStorage.setItem("mailflow_theme", "light");
      setDarkMode(false);
    } else {
      root.classList.add("dark");
      localStorage.setItem("mailflow_theme", "dark");
      setDarkMode(true);
    }
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6 transition-colors dark:border-slate-800 dark:bg-slate-950">
      
      {/* Page Title */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Dashboard
        </h2>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-5">

        {/* Notifications */}
        <button
          type="button"
          className="rounded-full p-2 text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-slate-800 dark:hover:text-white"
          title="Notifications"
        >
          <Bell size={20} />
        </button>

        {/* Theme Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className="rounded-full p-2 text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-slate-800 dark:hover:text-white"
          title={
            darkMode
              ? "Switch to light mode"
              : "Switch to dark mode"
          }
        >
          {darkMode ? (
            <Sun size={20} />
          ) : (
            <Moon size={20} />
          )}
        </button>

        {/* Profile */}
        <button
          type="button"
          className="rounded-full bg-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-300 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
        >
          Luna
        </button>

      </div>
    </header>
  );
}