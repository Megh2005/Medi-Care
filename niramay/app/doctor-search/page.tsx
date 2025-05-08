/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type React from "react";
import { useState } from "react";
import { Search, Star } from "lucide-react";
import axios from "axios";
import Link from "next/link";

interface Doctor {
  id: string;
  name: string;
  experience: string;
  description: string;
  specialist: string;
  degree: string;
  rating: number;
  reasoning: string;
  email: string;
  phone: string;
  location: string;
  languages: string[];
  availableDays: string[];
  availableTimeSlots: string[];
  user_rating: number;
}

export default function DoctorSearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState<Doctor | null>(null);
    const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true)
    setErrorMessage("");
    setSearchResult(null);

    if (!searchQuery) return;

    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/match-doctor`, {
        description: searchQuery,
      });
      setSearchResult(res.data);
      setSearchQuery("");
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err?.response?.data?.detail || "Something went wrong");
    } finally {
      setIsLoading(false)
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f5f2]">
      {/* Header */}
      <section className="bg-white py-16 border-b-4 border-black">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-black mb-6">Find the Right Doctor</h1>
          <p className="text-xl max-w-3xl mx-auto mb-8">
            Describe your symptoms or health concerns, and we will match you
            with the perfect specialist for your needs.
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-grow relative">
                <input
                  type="text"
                  placeholder="Describe your symptoms or health concerns..."
                  className="neo-brutalist-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search for doctors by describing your symptoms"
                />
              </div>
              <button
                type="submit"
                className="neo-brutalist-button flex items-center justify-center gap-2"
                disabled={isLoading}
              >
                <Search className="w-5 h-5" />
                {isLoading ? "Searching Doctor..." : "Search"}

              </button>
            </div>
          </form>

          {errorMessage && (
            <p className="text-red-600 mt-6 font-medium">{errorMessage}</p>
          )}
        </div>
      </section>

      {/* Search Results */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {searchResult ? (
            <div className="neo-brutalist-card overflow-hidden">
              <div className="p-6">
                <h3 className="text-2xl font-bold">{searchResult.name}</h3>
                <p className="text-primary font-semibold mb-2 flex items-center">
                  {searchResult.specialist}
                </p>

                <div className="flex grid-cols-3 items-center text-yellow-500 mb-2">
                  <strong>User Rating : </strong>{" "}
                  <Star className="w-4 h-4 mr-1" />
                  <span>{searchResult.rating}</span>
                </div>

                <div className="mb-2 grid-cols-2 flex gap-2">
                  <strong className="mb-2">Experience :</strong>
                  <p>{searchResult.experience}</p>
                </div>
                <div className="mb-2 grid-cols-2 flex gap-2">
                  <strong className="mb-2">Speciality :</strong>
                  <p>{searchResult.description}</p>
                </div>

                <div className="mb-4 grid-cols-2 flex gap-2">
                  <strong className="mb-2">Degree :</strong>
                  <p>{searchResult.degree}</p>
                </div>

                <div className="mb-4 grid-cols-2 italic flex gap-2">
                  <p>{searchResult.reasoning}</p>
                </div>

                <div className="mb-4">
                  <strong>Languages:</strong>{" "}
                  {searchResult.languages.join(", ")}
                </div>

                <div className="mt-6 text-center text-xl flex gap-3">
                  <Link
                    href={`/doctors/${searchResult.id}`}
                    className="neo-brutalist-button py-2 px-4 flex-1"
                  >
                    View Profile
                  </Link>
                </div>
              </div>
            </div>
          ) : errorMessage ? (
            <div className="text-center py-12 text-red-600 font-medium">
              {errorMessage}
            </div>
          ) : (
            !errorMessage &&
            !searchResult &&
            !searchQuery && <div className="text-center py-12"></div>
          )}
        </div>
      </section>
    </div>
  );
}
