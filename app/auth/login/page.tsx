"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    const result = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password");
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">{"\uD83D\uDE80"}</div>
          <h1 className="text-xl font-bold gradient-text">
            Learners Academy
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Your path to AI automation
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              placeholder="Password"
              required
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
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-sm text-text-secondary mt-4">
          No account?{" "}
          <Link href="/auth/register" className="text-accent-blue font-medium hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
