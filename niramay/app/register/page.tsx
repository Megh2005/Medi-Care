"use client";

import type React from "react";

import { useState } from "react";
import Link from "next/link";
import { UserPlus, ArrowRight, Loader2 } from "lucide-react";
import { register } from "@/actions/register";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export interface RegisterFormData {
  fullName: string;
  email: string;
  password: string;
  dateOfBirth: string;
  food: string;
  gender: string;
  phone: string;
}

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    dateOfBirth: "",
    food: "",
    gender: "",
    phone: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const router = useRouter();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
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
    setSuccessMessage("");

    try {
      const res = await register(formData);

      if (res.success) {
        toast(res.message, {
          duration: 3000,
          position: "top-right",
        });
        router.replace("/login");
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f5f2] flex items-center justify-center py-8 px-4">
      <div className="max-w-2xl w-full space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-black">
            Join <span className="text-primary">MEDI</span>CARE Today
          </h1>
          <p className="mt-2 text-gray-600">
            Create an account to access personalized healthcare services
          </p>
        </div>

        <div className="neo-brutalist-card p-6">
          {successMessage ? (
            <div className="text-center py-8">
              <div className="bg-green-100 text-green-800 p-4 mb-6 rounded-md">
                {successMessage}
              </div>
              <Link
                href="/login"
                className="neo-brutalist-button inline-flex items-center justify-center gap-2"
              >
                <ArrowRight size={20} />
                Sign In Now
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="text-2xl font-bold mb-4 border-b-2 border-black pb-2">
                Create Your Account
              </h2>

              {error && (
                <div className="bg-red-100 text-red-800 p-3 rounded-md">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="fullName" className="block font-bold mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  className="neo-brutalist-input"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleChange}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="email" className="block font-bold mb-1">
                    Email Address <span className="text-red-500">*</span>
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
                  <label htmlFor="phone" className="block font-bold mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    className="neo-brutalist-input"
                    placeholder="10-digit mobile number"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="password" className="block font-bold mb-1">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="neo-brutalist-input"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="dateOfBirth" className="block font-bold mb-1">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    required
                    className="neo-brutalist-input"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="gender" className="block font-bold mb-1">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  id="gender"
                  name="gender"
                  required
                  className="neo-brutalist-input"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option disabled value="">
                    Select gender
                  </option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>
              <div>
                <label htmlFor="food" className="block font-bold mb-1">
                  Food Preference <span className="text-red-500">*</span>
                </label>
                <select
                  id="food"
                  name="food"
                  required
                  className="neo-brutalist-input"
                  value={formData.food}
                  onChange={handleChange}
                >
                  <option disabled value="">
                    Select Preference
                  </option>
                  <option value="veg">Veg</option>
                  <option value="non-veg">Non Veg</option>
                  <option value="vegan">Vegan</option>
                </select>
              </div>

              <button
                type="submit"
                className="neo-brutalist-button w-full flex items-center justify-center gap-2 mt-6"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <UserPlus size={20} />
                )}
                {isLoading ? "Creating Account..." : "Create Account"}
              </button>
            </form>
          )}

          {!successMessage && (
            <div className="mt-4 text-center">
              <p>
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-primary font-bold hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
          )}
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
