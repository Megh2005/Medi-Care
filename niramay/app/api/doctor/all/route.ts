import { connectDB } from "@/lib/db";
import DoctorModel from "@/models/doctorModel";
import { NextResponse } from "next/server";

export async function GET() {
  await connectDB();

  try {
    const doctors = await DoctorModel.find().sort({ name: 1 });

    return NextResponse.json({
      success: true,
      data: doctors,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch doctors",
      },
      { status: 500 }
    );
  }
}
