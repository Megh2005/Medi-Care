/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link";
import {
  Star,
  MapPin,
  ArrowLeft,
  Check,
  Award,
  Stethoscope,
} from "lucide-react";
import { connectDB } from "@/lib/db";
import DoctorModel from "@/models/doctorModel";
import BookMeeting from "@/components/BookMeeting";

async function getDoctorInfo(id: string) {
  try {
    await connectDB();

    const doctor = await DoctorModel.findById(id);

    if (!doctor) {
      return null;
    }

    return doctor;
  } catch {
    return null;
  }
}

export default async function DoctorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;

  const doctor = await getDoctorInfo(id);

  // If doctor not found, show error
  if (!doctor) {
    return (
      <div className="min-h-screen bg-[#f8f5f2] py-12">
        <div className="container px-4 text-center">
          <h1 className="text-4xl font-black mb-8">Doctor Not Found</h1>
          <p className="mb-8">The doctor you are looking for does not exist.</p>
          <Link
            href="/doctors"
            className="neo-brutalist-button inline-flex items-center gap-2"
          >
            <ArrowLeft size={20} />
            Back to Doctors
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f5f2] py-12">
      <div className="container px-4">
        <div className="mb-8">
          <Link
            href="/doctors"
            className="text-primary font-bold hover:underline inline-flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back to Doctors
          </Link>
        </div>

        {/* Doctor Profile Header */}
        <div className="neo-brutalist-card mx-20 p-8 mb-8">
          <div className="flex flex-col gap-8">
            <div className="flex-1">
              <h1 className="text-3xl font-black">{doctor.name}</h1>
              <p className="text-xl text-primary font-bold mt-1">
                {doctor.specialist}
              </p>
              <p className="text-gray-600 mt-1">{doctor.degree}</p>

              <div className="flex items-center mt-3">
                <Star className="text-yellow-500 w-5 h-5 fill-yellow-500" />
                <span className="ml-1 font-medium">{doctor.user_rating}</span>
                <span className="mx-2">•</span>
                <span>{doctor.experience} experience</span>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center">
                  <MapPin className="text-primary mr-2" size={18} />
                  <span>{doctor.location}</span>
                </div>
              </div>
            </div>
          </div>
          <BookMeeting />
        </div>

        <div className="gap-8 mx-20">
          {/* Doctor Details */}
          <div className="md:col-span-2 space-y-8">
            {/* About */}
            <div className="neo-brutalist-card p-6">
              <h2 className="text-2xl font-bold mb-4 border-b-2 border-black pb-2">
                About
              </h2>
              <p className="text-gray-700">{doctor.about}</p>

              <div className="mt-6">
                <h3 className="font-bold text-lg mb-2">Languages</h3>
                <div className="flex flex-wrap gap-2">
                  {doctor.languages.map((language: any) => (
                    <span
                      key={language}
                      className="bg-gray-100 px-3 py-1 rounded-full text-sm"
                    >
                      {language}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Education */}
            <div className="neo-brutalist-card p-6">
              <h2 className="text-2xl font-bold mb-4 border-b-2 border-black pb-2 flex items-center">
                <Stethoscope className="mr-2 text-primary" size={24} />
                Education & Training
              </h2>
              <ul className="space-y-3">
                {doctor.education.map((edu: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <Check
                      className="text-primary mr-2 mt-1 flex-shrink-0"
                      size={18}
                    />
                    <span>{edu}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Specializations */}
            <div className="neo-brutalist-card p-6">
              <h2 className="text-2xl font-bold mb-4 border-b-2 border-black pb-2">
                Specializations
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {doctor.specializations.map((spec: string, index: number) => (
                  <div key={index} className="flex items-center">
                    <Check
                      className="text-primary mr-2 flex-shrink-0"
                      size={18}
                    />
                    <span>{spec}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Awards */}
            <div className="neo-brutalist-card p-6">
              <h2 className="text-2xl font-bold mb-4 border-b-2 border-black pb-2 flex items-center">
                <Award className="mr-2 text-primary" size={24} />
                Awards & Recognition
              </h2>
              <ul className="space-y-3">
                {doctor.awards.map((award: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <Check
                      className="text-primary mr-2 mt-1 flex-shrink-0"
                      size={18}
                    />
                    <span>{award}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>        
        </div>
      </div>
    </div>
  );
}
