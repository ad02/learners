"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: formData.get("email"),
        name: formData.get("name"),
        password: formData.get("password"),
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Registration failed");
    } else {
      router.push("/auth/login");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">{"\uD83D\uDE80"}</div>
          <h1 className="text-xl font-bold gradient-text">
            Create Account
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Join Learners Academy
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              name="name"
              type="text"
              placeholder="Your name"
              required
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20"
            />
          </div>
          <div>
            <input
              name="email"
              type="email"
              placeholder="Email"
              required
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20"
            />
          </div>
          <div>
            <input
              name="password"
              type="password"
              placeholder="Password (8+ characters)"
              required
              minLength={8}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20"
            />
          </div>

          {error && (
            <p className="text-accent-red text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold hover:from-blue-600 hover:to-purple-600 transition-all disabled:opacity-50 shadow-md hover:shadow-lg"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-sm text-text-secondary mt-4">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-accent-blue font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
