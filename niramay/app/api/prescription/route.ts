import { GoogleGenerativeAI } from "@google/generative-ai";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/config";
import Prescription from "@/models/prescriptionModel";
import { connectDB } from "@/lib/db";

export async function POST(request: Request) {
  await connectDB();

  try {
    const { fileType, imageData } = await request.json();

    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get API key from environment variable
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API key not configured" },
        { status: 500 }
      );
    }

    // Initialize the Google Generative AI client
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const prompt = `
    Analyze this prescription image and extract the following information in JSON format:
    
    1. Medications (for each medication):
       - Name
       - Medicine Chemical Composition
       - Dosage
       - Frequency
       - Duration
       - Purpose
       - Common side effects (list at least 2-3)
       - Important warnings (list at least 2)
       
    2. Doctor information:
       - Name
       - Specialty
       - License number
       
    3. Patient information:
       - Name
       - ID
       - Date
    
    Return ONLY valid JSON with this structure:
    {
      "medications": [
        {
          "name": "string",
          "dosage": "string",
          "frequency": "string",
          "duration": "string",
          "purpose": "string",
          "sideEffects": ["string", "string"],
          "composition": "string",
          "warnings": ["string", "string"]
        }
      ],
      "doctor": {
        "name": "string",
        "specialty": "string",
      },
      "patient": {
        "name": "string",
        "date": "string"
      }
    }
    
    Important: Avoid using complex medical terminology. Use plain language that a patient would understand.
    If you can't read certain information clearly, make a reasonable assumption and indicate it's an estimate.
    If the purpose of a medication is unspecified, provide the most common use for that medication.
    Always provide at least 2-3 warnings for each medication, even if they're not explicitly stated in the prescription.
    Make sure to explain dosage terms like sos , bd , tds , Q6H etc.
    In case of composition, analyze the medicine and tell the composition. Do not leave it empty. Use your knowledge base to tell the chemical composition. And also explain in simnple words about the composition I mean or what this composition is used for.
  `;

    // Run the prompt
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: fileType,
                data: imageData,
              },
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 2048,
      },
    });

    const response =
      result?.response?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    // Find JSON in the response (Gemini might wrap the JSON in markdown code blocks)
    const jsonMatch = response.match(/```json([\s\S]*?)```/) ||
      response.match(/```([\s\S]*?)```/) || [null, response];

    const jsonStr = jsonMatch[1] || response;

    await Prescription.create({
      prescriptionDescription: jsonStr,
      generatedBy: session.user._id,
    });

    return NextResponse.json(jsonStr);
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: error }, { status: 500 });
  }
}

export async function GET() {
  await connectDB();

  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const prescriptions = await Prescription.find({
      generatedBy: session.user._id,
    });

    if (!prescriptions) {
      return NextResponse.json(
        { message: "No prescriptions found" },
        { status: 404 }
      );
    }

    return NextResponse.json(prescriptions);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch prescriptions" },
      { status: 500 }
    );
  }
}
