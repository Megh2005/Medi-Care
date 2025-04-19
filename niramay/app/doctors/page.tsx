"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Star, MapPin, LoaderCircle } from "lucide-react";

interface Doctor {
  _id: string;
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

export default function DoctorsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [doctorsData, setDoctorsData] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/doctor/all");
        const data = await response.json();
        setDoctorsData(data.data);
      } catch (error) {
        console.error("Error fetching doctors:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  // Get unique specialties for filter
  const specialties = Array.from(
    new Set(doctorsData.map((doctor) => doctor.specialist))
  );

  // Filter doctors based on search term and specialty
  const filteredDoctors = doctorsData.filter((doctor) => {
    const matchesSearch =
      doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialist.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSpecialty =
      selectedSpecialty === "" || doctor.specialist === selectedSpecialty;

    return matchesSearch && matchesSpecialty;
  });

  return (
    <div className="min-h-screen bg-[#f8f5f2] py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-black mb-8">Our Doctors</h1>

        {/* Search and Filter */}
        <div className="neo-brutalist-card p-6 mb-8">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <div className="relative space-x-4">
                <input
                  type="text"
                  placeholder="Search by name..."
                  className="neo-brutalist-input pr-10 pl-10 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div>
              <div className="relative">
                <select
                  className="neo-brutalist-input pl-10 w-full appearance-none"
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                >
                  <option value="">All Specialties</option>
                  {specialties.map((specialty) => (
                    <option key={specialty} value={specialty}>
                      {specialty}
                    </option>
                  ))}
                </select>
                {/* <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} /> */}
              </div>
            </div>
          </div>
        </div>

        {loading && (
          <div>
            <LoaderCircle
              className="mx-auto animate-spin text-primary"
              size={40}
            />
            <p className="text-center text-gray-500 mt-4">Fetching doctors...</p>
          </div>
        )}

        {/* Doctors List */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {!loading &&
            filteredDoctors.length > 0 &&
            filteredDoctors.map((doctor) => (
              <Link href={`/doctors/${doctor._id}`} key={doctor._id}>
                <div className="neo-brutalist-card p-6 h-full hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,0.8)] transition-all duration-200">
                  <div className="flex items-start gap-4">
                    <div>
                      <h2 className="text-xl font-bold">{doctor.name}</h2>
                      <p className="text-primary font-semibold">
                        {doctor.specialist}
                      </p>
                      <div className="flex items-center mt-1">
                        <Star className="text-yellow-500 w-4 h-4 fill-yellow-500" />
                        <span className="ml-1 font-medium">
                          {doctor.user_rating}
                        </span>
                        <span className="mx-2">•</span>
                        <span className="capitalize">{doctor.experience} Experience</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-gray-600 line-clamp-2">
                      {doctor.description}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center text-sm text-gray-500">
                    <MapPin size={16} className="mr-1" />
                    <span>{doctor.location}</span>
                  </div>
                </div>
              </Link>
            ))}
        </div>

        {!loading && filteredDoctors.length === 0 && (
          <div className="neo-brutalist-card p-8 text-center">
            <p className="text-xl font-bold">
              No doctors found matching your search criteria.
            </p>
            <p className="mt-2">Try adjusting your search or filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}
