import Diet from "@/models/dietModel";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/config";
import { connectDB } from "@/lib/db";

export async function POST(request: Request) {
  await connectDB();

  try {
    const { prompt } = await request.json();
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

    // Run the prompt
    const result = await model.generateContent(
      prompt +
        " Format your response as valid JSON with the following structure: " +
        '{ "calorieNeeds": number, "macros": { "protein": number, "carbs": number, "fats": number }, ' +
        '"mealPlan": { "breakfast": string, "lunch": string, "dinner": string, "snacks": string }, ' +
        '"recommendations": [string, string, string] }'
    );

    const response = result.response;
    const text = response.text();

    // Extract JSON from response
    let jsonResponse;
    try {
      // Find JSON in the response (in case there's additional text)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonResponse = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No valid JSON found in response");
      }
    } catch (parseError) {
      console.error("Error parsing Gemini response as JSON:", parseError);
      console.log("Raw response:", text);

      // Return a fallback response
      return NextResponse.json({
        calorieNeeds: 2000,
        macros: {
          protein: 30,
          carbs: 40,
          fats: 30,
        },
        mealPlan: {
          breakfast: "Oatmeal with berries and nuts, Greek yogurt",
          lunch: "Grilled chicken salad with mixed vegetables",
          dinner: "Baked salmon with quinoa and steamed broccoli",
          snacks: "Apple with almond butter, protein shake",
        },
        recommendations: [
          "Stay hydrated by drinking at least 8 glasses of water daily",
          "Focus on whole, unprocessed foods",
          "Include a variety of colorful vegetables in your meals",
        ],
      });
    }

    await Diet.create({
      dietDescription: JSON.stringify(jsonResponse),
      generatedBy: session.user._id,
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return NextResponse.json(
      { error: "Failed to generate response from Gemini" },
      { status: 500 }
    );
  }
}

export async function GET() {
  await connectDB();

  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dietPlans = await Diet.find({
      generatedBy: session.user._id,
    });

    if (!dietPlans) {
      return NextResponse.json(
        { message: "No diet plans found" },
        { status: 404 }
      );
    }

    return NextResponse.json(dietPlans);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch diet plans" },
      { status: 500 }
    );
  }
}
