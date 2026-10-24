import { Bell, Moon, Sun, User, LogOut } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getCurrentUser, logout } from "@/services/auth";

export default function Navbar() {
  const navigate = useNavigate();

  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const profileRef = useRef(null);

  // =====================================================
  // LOAD USER + THEME
  // =====================================================

  useEffect(() => {
    const loadUser = async () => {
      try {
        const data = await getCurrentUser();
        setUser(data);
      } catch (error) {
        console.error("Failed to load user:", error);
      }
    };

    loadUser();

    const savedTheme =
      localStorage.getItem("mailflow_theme");

    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
      setDarkMode(true);
    } else if (savedTheme === "light") {
      document.documentElement.classList.remove("dark");
      setDarkMode(false);
    } else if (savedTheme === "system") {
      const prefersDark =
        window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches;

      if (prefersDark) {
        document.documentElement.classList.add("dark");
        setDarkMode(true);
      }
    }
  }, []);

  // =====================================================
  // CLOSE DROPDOWN WHEN CLICKING OUTSIDE
  // =====================================================

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  // =====================================================
  // TOGGLE DARK MODE
  // =====================================================

  const toggleTheme = () => {
    const root = document.documentElement;

    if (root.classList.contains("dark")) {
      root.classList.remove("dark");

      localStorage.setItem(
        "mailflow_theme",
        "light"
      );

      setDarkMode(false);
    } else {
      root.classList.add("dark");

      localStorage.setItem(
        "mailflow_theme",
        "dark"
      );

      setDarkMode(true);
    }
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = async () => {
    try {
      setLoggingOut(true);

      await logout();

      setProfileOpen(false);

      navigate("/login", {
        replace: true,
      });
    } catch (error) {
      console.error("Logout failed:", error);

      alert("Unable to sign out. Please try again.");
    } finally {
      setLoggingOut(false);
    }
  };

  // =====================================================
  // USER DETAILS
  // =====================================================

  const displayName = user?.name || "User";
  const displayEmail = user?.email || "";

  const initial =
    displayName.charAt(0).toUpperCase();

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6 transition-colors dark:border-slate-800 dark:bg-slate-950">

      {/* =================================================
          PAGE TITLE
      ================================================= */}

      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Dashboard
        </h2>
      </div>

      {/* =================================================
          RIGHT SIDE
      ================================================= */}

      <div className="flex items-center gap-4">

        {/* Notification */}

        <button
          type="button"
          className="rounded-full p-2 text-gray-600 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-800"
          title="Notifications"
        >
          <Bell size={20} />
        </button>

        {/* Theme */}

        <button
          type="button"
          onClick={toggleTheme}
          className="rounded-full p-2 text-gray-600 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-800"
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

        {/* =================================================
            PROFILE BUTTON
        ================================================= */}

        <div
          ref={profileRef}
          className="relative"
        >

          <button
            type="button"
            onClick={() =>
              setProfileOpen(
                (current) => !current
              )
            }
            className="flex items-center gap-2 rounded-full bg-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-300 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
          >

            {/* Avatar */}

            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
              {initial}
            </div>

            {displayName}

          </button>

          {/* =================================================
              DROPDOWN
          ================================================= */}

          {profileOpen && (
            <div className="absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">

              {/* User information */}

              <div className="border-b border-gray-200 px-5 py-4 dark:border-slate-700">

                <div className="flex items-center gap-3">

                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white">
                    {initial}
                  </div>

                  <div className="min-w-0">

                    <p className="truncate font-semibold text-gray-900 dark:text-white">
                      {displayName}
                    </p>

                    <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                      {displayEmail}
                    </p>

                  </div>

                </div>

              </div>

              {/* =================================================
                  PROFILE & SETTINGS
              ================================================= */}

              <div className="p-2">

                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    navigate("/settings");
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm text-gray-700 transition hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-slate-800"
                >

                  <User size={18} />

                  <div>

                    <p className="font-medium">
                      Profile & Settings
                    </p>

                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Manage your account
                    </p>

                  </div>

                </button>

              </div>

              {/* =================================================
                  SIGN OUT
              ================================================= */}

              <div className="border-t border-gray-200 p-2 dark:border-slate-700">

                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-950/30"
                >

                  <LogOut size={18} />

                  {loggingOut
                    ? "Signing out..."
                    : "Sign out"}

                </button>

              </div>

            </div>
          )}

        </div>

      </div>

    </header>
  );
}