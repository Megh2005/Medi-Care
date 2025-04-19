import Link from "next/link";
import { User, Mail, Phone, Calendar, Apple } from "lucide-react";
import { connectDB } from "@/lib/db";
import UserModel from "@/models/userModel";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/config";
import ProfileRecords from "@/components/ProfileRecords";

type UserData = {
  fullName: string;
  email: string;
  dateOfBirth: string;
  gender: string;
  phone: string;
  foodPreference: string;
};

async function getUserProfile(userId: string) {
  await connectDB();
  const user = await UserModel.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  return user;
}

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || !session.user._id) {
    return (
      <div className="min-h-screen bg-[#f8f5f2] flex items-center justify-center py-8 px-4">
        <h1 className="text-4xl font-black">
          Please{" "}
          <Link href="/login" className="text-primary">
            Login
          </Link>{" "}
          to view your profile
        </h1>
      </div>
    );
  }

  const userId = session.user._id;
  const userData: UserData = await getUserProfile(userId!);

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-[#f8f5f2] py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {/* Profile Details */}
          <div className="neo-brutalist-card p-8">
            <h2 className="text-3xl font-bold mb-6 border-b-2 border-black pb-2">
              Profile Information
            </h2>
            <div className="space-y-4">
              <div className="neo-brutalist-card p-4 bg-gray-50">
                <div className="flex items-center gap-3">
                  <User className="text-primary" />
                  <div>
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="font-bold capitalize">{userData.fullName}</p>
                  </div>
                </div>
              </div>
              <div className="neo-brutalist-card p-4 bg-gray-50">
                <div className="flex items-center gap-3">
                  <Mail className="text-primary" />
                  <div>
                    <p className="text-sm text-gray-500">Email Address</p>
                    <p className="font-bold">{userData.email}</p>
                  </div>
                </div>
              </div>
              <div className="neo-brutalist-card p-4 bg-gray-50">
                <div className="flex items-center gap-3">
                  <Phone className="text-primary" />
                  <div>
                    <p className="text-sm text-gray-500">Phone Number</p>
                    <p className="font-bold">{userData.phone}</p>
                  </div>
                </div>
              </div>
              <div className="neo-brutalist-card p-4 bg-gray-50">
                <div className="flex items-center gap-3">
                  <Calendar className="text-primary" />
                  <div>
                    <p className="text-sm text-gray-500">Date of Birth</p>
                    <p className="font-bold">
                      {formatDate(userData.dateOfBirth)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="neo-brutalist-card p-4 bg-gray-50">
                <div className="flex items-center gap-3">
                  <User className="text-primary" />
                  <div>
                    <p className="text-sm text-gray-500">Gender</p>
                    <p className="font-bold capitalize">{userData.gender}</p>
                  </div>
                </div>
              </div>
              {userData.foodPreference && (
                <div className="neo-brutalist-card p-4 bg-gray-50">
                  <div className="flex items-center gap-3">
                    <Apple className="text-primary" />
                    <div>
                      <p className="text-sm text-gray-500">Food Preference</p>
                      <p className="font-bold capitalize">
                        {userData.foodPreference}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <ProfileRecords />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
