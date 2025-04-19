// File: app/api/gemini/route.ts

import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

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

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return NextResponse.json(
      { error: "Failed to generate response from Gemini" },
      { status: 500 }
    );
  }
}
