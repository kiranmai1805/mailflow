import { useEffect, useState } from "react";
import {
  User,
  Mail,
  Shield,
  Moon,
  Sun,
  Monitor,
  LogOut,
  ExternalLink,
  Save,
  CheckCircle,
  Lock,
  Eye,
  EyeOff,
  X,
} from "lucide-react";

import {
  getCurrentUser,
  updateProfile,
  changePassword,
  logout,
} from "@/services/auth";

import { useNavigate } from "react-router-dom";

import axios from "axios";


const API_URL = "https://mailflow-gh75.onrender.com";




export default function Settings() {

  const navigate = useNavigate();


  // =====================================================
  // USER
  // =====================================================

  const [user, setUser] = useState(null);

  const [name, setName] = useState("");

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");


  const [showPasswordForm, setShowPasswordForm] =
  useState(false);

const [currentPassword, setCurrentPassword] =
  useState("");

const [newPassword, setNewPassword] =
  useState("");

const [confirmPassword, setConfirmPassword] =
  useState("");

const [changingPassword, setChangingPassword] =
  useState(false);

const [passwordMessage, setPasswordMessage] =
  useState("");

const [passwordError, setPasswordError] =
  useState("");

const [showCurrentPassword, setShowCurrentPassword] =
  useState(false);

const [showNewPassword, setShowNewPassword] =
  useState(false);

const [showConfirmPassword, setShowConfirmPassword] =
  useState(false);


  // =====================================================
  // THEME
  // =====================================================

  const [theme, setTheme] = useState("light");


  // =====================================================
  // ACCOUNT STATISTICS
  // =====================================================

  const [campaignCount, setCampaignCount] =
    useState(0);

  const [contactCount, setContactCount] =
    useState(0);

  const [emailAccountCount, setEmailAccountCount] =
    useState(0);


  // =====================================================
  // LOAD DATA
  // =====================================================

  useEffect(() => {

    const loadData = async () => {

      try {

        const [
          userData,
          campaignsResponse,
          contactsResponse,
          emailAccountsResponse,
        ] = await Promise.all([
          getCurrentUser(),

          axios.get(
            `${API_URL}/campaigns/`,
            {
              withCredentials: true,
            }
          ),

          axios.get(
            `${API_URL}/contacts/`,
            {
              withCredentials: true,
            }
          ),

          axios.get(
            `${API_URL}/email-accounts/`,
            {
              withCredentials: true,
            }
          ),
        ]);


        setUser(userData);

        setName(userData.name);


        setCampaignCount(
          campaignsResponse.data.length
        );

        setContactCount(
          contactsResponse.data.length
        );

        setEmailAccountCount(
          emailAccountsResponse.data.length
        );


        const savedTheme =
          localStorage.getItem(
            "mailflow_theme"
          );

        if (savedTheme) {
          setTheme(savedTheme);
        } else {
          setTheme("light");
        }

      } catch (error) {

        console.error(
          "Failed to load settings:",
          error
        );

      } finally {

        setLoading(false);

      }

    };


    loadData();

  }, []);


  // =====================================================
  // THEME CHANGE
  // =====================================================

  const changeTheme = (newTheme) => {

    setTheme(newTheme);

    const root =
      document.documentElement;


    if (newTheme === "dark") {

      root.classList.add("dark");

      localStorage.setItem(
        "mailflow_theme",
        "dark"
      );

    } else if (newTheme === "light") {

      root.classList.remove("dark");

      localStorage.setItem(
        "mailflow_theme",
        "light"
      );

    } else {

      localStorage.setItem(
        "mailflow_theme",
        "system"
      );

      const prefersDark =
        window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches;


      if (prefersDark) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }

    }

  };


  // =====================================================
  // SAVE PROFILE
  // =====================================================

  const handleSaveProfile = async () => {

    setMessage("");
    setError("");


    if (!name.trim()) {

      setError(
        "Name cannot be empty."
      );

      return;

    }


    try {

      setSaving(true);

      const response =
        await updateProfile(
          name.trim()
        );


      setUser(response.user);

      setName(response.user.name);

      setMessage(
        "Profile updated successfully."
      );

    } catch (error) {

      console.error(
        "Failed to update profile:",
        error
      );

      setError(
        error.response?.data?.detail ||
          "Failed to update profile."
      );

    } finally {

      setSaving(false);

    }

  };


  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = async () => {

    try {

      await logout();

      navigate("/login", {
        replace: true,
      });

    } catch (error) {

      console.error(
        "Logout failed:",
        error
      );

    }

  };

const handleChangePassword = async () => {
  setPasswordMessage("");
  setPasswordError("");

  if (!currentPassword) {
    setPasswordError(
      "Please enter your current password."
    );
    return;
  }

  if (!newPassword) {
    setPasswordError(
      "Please enter a new password."
    );
    return;
  }

  if (newPassword.length < 8) {
    setPasswordError(
      "New password must be at least 8 characters long."
    );
    return;
  }

  if (newPassword !== confirmPassword) {
    setPasswordError(
      "New passwords do not match."
    );
    return;
  }

  try {
    setChangingPassword(true);

    const response = await changePassword(
      currentPassword,
      newPassword,
      confirmPassword
    );

    setPasswordMessage(
      response.message ||
        "Password changed successfully."
    );

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");

    setTimeout(() => {
      setShowPasswordForm(false);
      setPasswordMessage("");
    }, 2000);

  } catch (error) {
    console.error(
      "Failed to change password:",
      error
    );

    setPasswordError(
      error.response?.data?.detail ||
        "Failed to change password."
    );
  } finally {
    setChangingPassword(false);
  }
};
  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {

    return (
      <div className="flex min-h-[70vh] items-center justify-center">

        <p className="text-gray-500 dark:text-gray-400">
          Loading account settings...
        </p>

      </div>
    );

  }


  // =====================================================
  // INITIAL
  // =====================================================

  const initial =
    user?.name
      ?.charAt(0)
      ?.toUpperCase() || "U";


  return (

    <div className="mx-auto max-w-6xl space-y-8">


      {/* =================================================
          HEADER
      ================================================= */}

      <div>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Profile & Settings
        </h1>

        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Manage your MailFlow account,
          preferences and connected services.
        </p>

      </div>


      {/* =================================================
          PROFILE
      ================================================= */}

      <section className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">

        <div className="border-b border-gray-200 p-6 dark:border-slate-800">

          <div className="flex items-center gap-3">

            <div className="rounded-xl bg-blue-100 p-3 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">

              <User size={22} />

            </div>

            <div>

              <h2 className="text-lg font-semibold">
                Profile
              </h2>

              <p className="text-sm text-gray-500 dark:text-gray-400">
                Your personal account information.
              </p>

            </div>

          </div>

        </div>


        <div className="p-6">


          {/* Profile identity */}

          <div className="mb-8 flex items-center gap-4">

            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white">

              {initial}

            </div>


            <div>

              <h3 className="text-lg font-semibold">
                {user?.name}
              </h3>

              <p className="text-sm text-gray-500 dark:text-gray-400">
                {user?.email}
              </p>

            </div>

          </div>


          {/* Form */}

          <div className="grid gap-6 md:grid-cols-2">


            <div>

              <label className="mb-2 block text-sm font-medium">
                Full Name
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:focus:ring-blue-950"
              />

            </div>


            <div>

              <label className="mb-2 block text-sm font-medium">
                Email Address
              </label>

              <div className="relative">

                <Mail
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-100 py-3 pl-10 pr-4 text-gray-500 dark:border-slate-800 dark:bg-slate-900 dark:text-gray-400"
                />

              </div>

              <p className="mt-2 text-xs text-gray-400">
                Email changes are currently disabled.
              </p>

            </div>

          </div>


          {/* Messages */}

          {message && (

            <div className="mt-5 flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-700 dark:bg-green-950/30 dark:text-green-400">

              <CheckCircle size={17} />

              {message}

            </div>

          )}


          {error && (

            <div className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">

              {error}

            </div>

          )}


          {/* Save */}

          <div className="mt-6">

            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >

              <Save size={17} />

              {saving
                ? "Saving..."
                : "Save Changes"}

            </button>

          </div>

        </div>

      </section>


      {/* =================================================
          ACCOUNT OVERVIEW
      ================================================= */}

      <section>

        <div className="mb-4">

          <h2 className="text-xl font-semibold">
            Account Overview
          </h2>

          <p className="text-sm text-gray-500 dark:text-gray-400">
            Your MailFlow activity.
          </p>

        </div>


        <div className="grid gap-5 md:grid-cols-3">


          {/* Campaigns */}

          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">

            <p className="text-sm text-gray-500">
              Campaigns
            </p>

            <p className="mt-2 text-3xl font-bold">
              {campaignCount}
            </p>

            <p className="mt-2 text-xs text-gray-400">
              Campaigns created
            </p>

          </div>


          {/* Contacts */}

          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">

            <p className="text-sm text-gray-500">
              Contacts
            </p>

            <p className="mt-2 text-3xl font-bold">
              {contactCount}
            </p>

            <p className="mt-2 text-xs text-gray-400">
              Saved recipients
            </p>

          </div>


          {/* Email Accounts */}

          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">

            <p className="text-sm text-gray-500">
              Email Accounts
            </p>

            <p className="mt-2 text-3xl font-bold">
              {emailAccountCount}
            </p>

            <p className="mt-2 text-xs text-gray-400">
              Connected sender accounts
            </p>

          </div>

        </div>

      </section>


      {/* =================================================
          PREFERENCES
      ================================================= */}

      <section className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">

        <div className="border-b border-gray-200 p-6 dark:border-slate-800">

          <div className="flex items-center gap-3">

            <div className="rounded-xl bg-purple-100 p-3 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400">

              {theme === "dark" ? (
                <Moon size={22} />
              ) : (
                <Sun size={22} />
              )}

            </div>

            <div>

              <h2 className="text-lg font-semibold">
                Preferences
              </h2>

              <p className="text-sm text-gray-500 dark:text-gray-400">
                Customize how MailFlow looks.
              </p>

            </div>

          </div>

        </div>


        <div className="p-6">

          <p className="mb-4 text-sm font-medium">
            Appearance
          </p>


          <div className="grid gap-3 sm:grid-cols-3">


            {/* Light */}

            <button
              onClick={() =>
                changeTheme("light")
              }
              className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${
                theme === "light"
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
                  : "border-gray-200 hover:bg-gray-50 dark:border-slate-700 dark:hover:bg-slate-900"
              }`}
            >

              <Sun size={20} />

              <div>

                <p className="font-medium">
                  Light
                </p>

                <p className="text-xs text-gray-500">
                  Bright interface
                </p>

              </div>

            </button>


            {/* Dark */}

            <button
              onClick={() =>
                changeTheme("dark")
              }
              className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${
                theme === "dark"
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
                  : "border-gray-200 hover:bg-gray-50 dark:border-slate-700 dark:hover:bg-slate-900"
              }`}
            >

              <Moon size={20} />

              <div>

                <p className="font-medium">
                  Dark
                </p>

                <p className="text-xs text-gray-500">
                  Easy on the eyes
                </p>

              </div>

            </button>


            {/* System */}

            <button
              onClick={() =>
                changeTheme("system")
              }
              className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${
                theme === "system"
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
                  : "border-gray-200 hover:bg-gray-50 dark:border-slate-700 dark:hover:bg-slate-900"
              }`}
            >

              <Monitor size={20} />

              <div>

                <p className="font-medium">
                  System
                </p>

                <p className="text-xs text-gray-500">
                  Follow device theme
                </p>

              </div>

            </button>

          </div>

        </div>

      </section>


      {/* =================================================
          SECURITY
      ================================================= */}

      {/* =================================================
    SECURITY
================================================= */}

<section className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">

  <div className="flex items-center justify-between p-6">

    <div className="flex items-center gap-3">

      <div className="rounded-xl bg-green-100 p-3 text-green-600 dark:bg-green-950/50 dark:text-green-400">

        <Shield size={22} />

      </div>

      <div>

        <h2 className="text-lg font-semibold">
          Security
        </h2>

        <p className="text-sm text-gray-500 dark:text-gray-400">
          Manage your account security.
        </p>

      </div>

    </div>


    {!showPasswordForm && (
      <button
        onClick={() => {
          setShowPasswordForm(true);
          setPasswordError("");
          setPasswordMessage("");
        }}
        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium transition hover:bg-gray-50 dark:border-slate-700 dark:hover:bg-slate-800"
      >
        Change Password
      </button>
    )}

  </div>


  {!showPasswordForm ? (

    <div className="border-t border-gray-200 px-6 py-4 text-sm text-gray-500 dark:border-slate-800 dark:text-gray-400">

      Keep your MailFlow account secure by using
      a strong password.

    </div>

  ) : (

    <div className="border-t border-gray-200 p-6 dark:border-slate-800">

      <div className="max-w-xl space-y-5">


        {/* Current Password */}

        <div>

          <label className="mb-2 block text-sm font-medium">
            Current Password
          </label>

          <div className="relative">

            <Lock
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type={
                showCurrentPassword
                  ? "text"
                  : "password"
              }
              value={currentPassword}
              onChange={(e) =>
                setCurrentPassword(
                  e.target.value
                )
              }
              placeholder="Enter current password"
              className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-12 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:focus:ring-blue-950"
            />

            <button
              type="button"
              onClick={() =>
                setShowCurrentPassword(
                  (value) => !value
                )
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              {showCurrentPassword ? (
                <EyeOff size={18} />
              ) : (
                <Eye size={18} />
              )}
            </button>

          </div>

        </div>


        {/* New Password */}

        <div>

          <label className="mb-2 block text-sm font-medium">
            New Password
          </label>

          <div className="relative">

            <Lock
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type={
                showNewPassword
                  ? "text"
                  : "password"
              }
              value={newPassword}
              onChange={(e) =>
                setNewPassword(
                  e.target.value
                )
              }
              placeholder="Enter new password"
              className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-12 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:focus:ring-blue-950"
            />

            <button
              type="button"
              onClick={() =>
                setShowNewPassword(
                  (value) => !value
                )
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              {showNewPassword ? (
                <EyeOff size={18} />
              ) : (
                <Eye size={18} />
              )}
            </button>

          </div>

          <p className="mt-2 text-xs text-gray-400">
            Password must contain at least 8 characters.
          </p>

        </div>


        {/* Confirm Password */}

        <div>

          <label className="mb-2 block text-sm font-medium">
            Confirm New Password
          </label>

          <div className="relative">

            <Lock
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type={
                showConfirmPassword
                  ? "text"
                  : "password"
              }
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(
                  e.target.value
                )
              }
              placeholder="Confirm new password"
              className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-12 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:focus:ring-blue-950"
            />

            <button
              type="button"
              onClick={() =>
                setShowConfirmPassword(
                  (value) => !value
                )
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              {showConfirmPassword ? (
                <EyeOff size={18} />
              ) : (
                <Eye size={18} />
              )}
            </button>

          </div>

        </div>


        {/* Success */}

        {passwordMessage && (

          <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-700 dark:bg-green-950/30 dark:text-green-400">

            <CheckCircle size={17} />

            {passwordMessage}

          </div>

        )}


        {/* Error */}

        {passwordError && (

          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">

            {passwordError}

          </div>

        )}


        {/* Buttons */}

        <div className="flex gap-3">

          <button
            onClick={handleChangePassword}
            disabled={changingPassword}
            className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >

            {changingPassword
              ? "Changing Password..."
              : "Change Password"}

          </button>


          <button
            onClick={() => {
              setShowPasswordForm(false);

              setCurrentPassword("");
              setNewPassword("");
              setConfirmPassword("");

              setPasswordError("");
              setPasswordMessage("");
            }}
            disabled={changingPassword}
            className="flex items-center gap-2 rounded-lg border border-gray-300 px-5 py-3 font-medium transition hover:bg-gray-50 disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800"
          >

            <X size={17} />

            Cancel

          </button>

        </div>

      </div>

    </div>

  )}

</section>

      {/* =================================================
          EMAIL ACCOUNTS
      ================================================= */}

      <section className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">

        <div className="flex items-center justify-between p-6">

          <div className="flex items-center gap-3">

            <div className="rounded-xl bg-orange-100 p-3 text-orange-600 dark:bg-orange-950/50 dark:text-orange-400">

              <Mail size={22} />

            </div>

            <div>

              <h2 className="text-lg font-semibold">
                Email Accounts
              </h2>

              <p className="text-sm text-gray-500 dark:text-gray-400">
                Manage the accounts used to send campaigns.
              </p>

            </div>

          </div>


          <button
            onClick={() =>
              navigate("/email-accounts")
            }
            className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium transition hover:bg-gray-50 dark:border-slate-700 dark:hover:bg-slate-800"
          >

            Manage

            <ExternalLink size={15} />

          </button>

        </div>

      </section>


      {/* =================================================
          ACCOUNT
      ================================================= */}

      <section className="rounded-2xl border border-red-200 bg-white shadow-sm dark:border-red-950 dark:bg-slate-950">

        <div className="p-6">

          <h2 className="text-lg font-semibold text-red-600 dark:text-red-400">
            Account
          </h2>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage your MailFlow session.
          </p>


          <div className="mt-5">

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg bg-red-600 px-5 py-3 font-medium text-white transition hover:bg-red-700"
            >

              <LogOut size={17} />

              Sign out of MailFlow

            </button>

          </div>

        </div>

      </section>

    </div>

  );
}