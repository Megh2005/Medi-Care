"use client";

import type React from "react";

import { useState } from "react";
import Link from "next/link";
import { LogIn, ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation"; // Import for navigation after login
import { signIn } from "next-auth/react"; // Import for NextAuth sign-in

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    const res = await signIn("credentials", {
      email: formData.email,
      password: formData.password,
      redirect: false,
    });

    if (res?.error) {
      setError(res.error || "Invalid email or password. Please try again.");
      setIsLoading(false);
      return;
    }

    if (res?.ok) {
      setError("");
      setFormData({ email: "", password: "" });
      router.push("/profile");
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#f8f5f2] flex items-center justify-center py-8 px-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-black">
            Welcome Back to <span className="text-primary">MEDI</span>CARE
          </h1>
          <p className="mt-2 text-gray-600">
            Sign in to access your healthcare dashboard
          </p>
        </div>

        <div className="neo-brutalist-card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-2xl font-bold mb-4 border-b-2 border-black pb-2">
              Sign In
            </h2>

            {error && (
              <div className="bg-red-100 text-red-800 p-3 rounded-md">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block font-bold mb-1">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="neo-brutalist-input"
                placeholder="your@email.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="password" className="block font-bold mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="neo-brutalist-input"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <button
              type="submit"
              className="neo-brutalist-button w-full flex items-center justify-center gap-2 mt-6"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <LogIn size={20} />
              )}
              {isLoading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p>
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="text-primary font-bold hover:underline"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>

        <div className="text-center">
          <Link
            href="/"
            className="text-sm text-gray-600 hover:text-primary flex items-center justify-center gap-1"
          >
            <ArrowRight size={16} className="transform rotate-180" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
