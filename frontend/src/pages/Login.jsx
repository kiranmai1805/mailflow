import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { login } from "@/services/auth";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      await login(email, password);

      navigate("/");
    } catch (error) {
      console.error("Login failed:", error);

      setError(
        error.response?.data?.detail ||
          "Invalid email or password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 dark:bg-black">

      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-950">

        {/* Logo */}

        <div className="mb-8 text-center">

          <div className="mb-3 text-4xl">
            📧
          </div>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            MailFlow
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Sign in to your account
          </p>

        </div>


        {/* Error */}

        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}


        {/* Form */}

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          <div>

            <label className="mb-2 block text-sm font-medium">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="you@example.com"
              className="w-full rounded-lg border border-gray-300 bg-white p-3 outline-none transition focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900"
            />

          </div>


          <div>

            <label className="mb-2 block text-sm font-medium">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="Enter your password"
              className="w-full rounded-lg border border-gray-300 bg-white p-3 outline-none transition focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900"
            />

          </div>


          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Signing in..."
              : "Sign In"}
          </button>

        </form>


        {/* Signup */}

        <p className="mt-6 text-center text-sm text-gray-500">

          Don't have an account?{" "}

          <Link
            to="/signup"
            className="font-medium text-blue-600 hover:underline"
          >
            Create one
          </Link>

        </p>

      </div>

    </div>
  );
}