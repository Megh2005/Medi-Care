"use server";

import { RegisterFormData } from "@/app/register/page";
import { connectDB } from "@/lib/db";
import UserModel from "@/models/userModel";
import bcrypt from "bcrypt";

export async function register(registerData: RegisterFormData) {
  if (!registerData) {
    throw new Error("No data provided");
  }

  await connectDB();

  try {
    const existingUser = await UserModel.findOne({
      $or: [{ email: registerData.email }, { phone: registerData.phone }],
    });

    if (existingUser) {
      throw new Error("User already exists");
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(registerData.password, 7);
    registerData.password = hashedPassword;

    const res = await UserModel.create(registerData);

    if (!res) throw new Error("Failed to register user");

    return { success: true, message: "User registered successfully" };
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "An error occurred"
    );
  }
}
