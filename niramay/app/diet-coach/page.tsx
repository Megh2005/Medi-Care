"use client";

import type React from "react";
import { useState } from "react";

type GeminiResponse = {
  calorieNeeds: number;
  macros: {
    protein: number;
    carbs: number;
    fats: number;
  };
  mealPlan: {
    breakfast: string;
    lunch: string;
    dinner: string;
    snacks: string;
  };
  recommendations: string[];
};

export default function DietCoachPage() {
  const [formData, setFormData] = useState({
    height: 170,
    weight: 70,
    age: 30,
    gender: "male",
    goal: "maintain",
    dietaryRestrictions: [] as string[],
  });

  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<GeminiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setFormData((prev) => {
      if (checked) {
        return {
          ...prev,
          dietaryRestrictions: [...prev.dietaryRestrictions, value],
        };
      } else {
        return {
          ...prev,
          dietaryRestrictions: prev.dietaryRestrictions.filter(
            (item) => item !== value
          ),
        };
      }
    });
  };

  const generateAIResponse = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const bmr =
        formData.gender === "male"
          ? 10 * formData.weight + 6.25 * formData.height - 5 * formData.age + 5
          : 10 * formData.weight +
            6.25 * formData.height -
            5 * formData.age -
            161;
      let calorieAdjustment = 0;
      if (formData.goal === "lose") calorieAdjustment = -500;
      if (formData.goal === "gain") calorieAdjustment = 500;

      const adjustedCalories = Math.round(bmr + calorieAdjustment);
      const prompt = `
Create a personalized Indian diet plan for someone from a middle-class background with the following characteristics:
- Height: ${formData.height} cm
- Weight: ${formData.weight} kg
- Age: ${formData.age} years
- Gender: ${formData.gender}
- Goal: ${formData.goal} weight
- Dietary restrictions: ${formData.dietaryRestrictions.join(", ") || "None"}

Assume the person prefers homemade, traditional Indian meals that are affordable and easily accessible. Include locally available and seasonal ingredients commonly found in Indian households.
Their calculated daily caloric needs are approximately ${adjustedCalories} calories.

Provide the following in JSON format:
1. daily_calorie_needs (number)
2. macronutrient_breakdown (protein, carbs, fats percentages)
3. sample_meal_plan: {
   breakfast,
   lunch,
   dinner,
   snacks
   // Use affordable Indian dishes like poha, dal-chawal, roti-sabzi, idli, etc.
}
4. dietary_recommendations: [
   // 3 simple personalized recommendations considering affordability and Indian lifestyle
]
`;
      const response = await fetch("/api/diet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      console.log(response);
      setAiResponse(data);
    } catch (err) {
      console.error("Error calling Gemini API:", err);
      setError("Failed to generate AI response. Please try again later.");
      const bmr = Math.round(
        formData.gender === "male"
          ? 10 * formData.weight + 6.25 * formData.height - 5 * formData.age + 5
          : 10 * formData.weight +
              6.25 * formData.height -
              5 * formData.age -
              161
      );

      setAiResponse({
        calorieNeeds: bmr,
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
    } finally {
      setIsLoading(false);
      setShowResults(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    generateAIResponse();
  };

  // Print functionality
  const handlePrint = () => {
    const printContent = document.getElementById("printSection");
    const WinPrint = window.open("", "", "width=900,height=650");

    if (WinPrint && printContent) {
      // Get user info for print
      const goalText =
        formData.goal === "lose"
          ? "Weight Loss"
          : formData.goal === "gain"
          ? "Weight Gain"
          : "Weight Maintenance";

      const restrictions =
        formData.dietaryRestrictions.length > 0
          ? formData.dietaryRestrictions.join(", ")
          : "None";

      WinPrint.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Your Personalized Diet Plan</title>
          <style>
        @media print {
          @page { margin: 0.5cm; }
        }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.5;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          border-bottom: 3px solid #000;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .title {
          font-size: 28px;
          font-weight: 800;
          margin-bottom: 5px;
        }
        .subtitle {
          font-size: 16px;
          color: #555;
        }
        .user-info {
          background-color: #f9f9f9;
          border: 2px solid #000;
          padding: 15px;
          margin-bottom: 30px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          grid-gap: 15px;
        }
        .user-info p {
          margin: 5px 0;
        }
        .section {
          margin-bottom: 30px;
        }
        .section-title {
          font-size: 20px;
          font-weight: bold;
          border-bottom: 2px solid #000;
          padding-bottom: 5px;
          margin-bottom: 15px;
        }
        .calories {
          font-size: 22px;
          font-weight: bold;
          text-align: center;
          background-color: #FFF9C4;
          padding: 12px;
          border: 2px solid #000;
        }
        .macros {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          grid-gap: 15px;
          margin-bottom: 20px;
        }
        .macro-card {
          border: 2px solid #000;
          padding: 10px;
          text-align: center;
        }
        .macro-card.protein { background-color: #C8E6C9; }
        .macro-card.carbs { background-color: #BBDEFB; }
        .macro-card.fats { background-color: #FFCDD2; }
        .macro-title {
          font-weight: bold;
          margin-bottom: 5px;
        }
        .macro-value {
          font-size: 20px;
          font-weight: bold;
        }
        .meal-section {
          margin-bottom: 20px;
        }
        .meal-title {
          font-weight: bold;
          margin-bottom: 5px;
        }
        .meal-content {
          border: 2px solid #000;
          padding: 10px;
          background-color: #fff;
        }
        .recommendations {
          border: 2px solid #000;
          padding: 15px;
          background-color: #F3E5F5;
        }
        .recommendations ul {
          margin: 0;
          padding-left: 20px;
        }
        .recommendations li {
          margin-bottom: 8px;
        }
        .footer {
          margin-top: 30px;
          text-align: center;
          font-size: 14px;
          color: #666;
          border-top: 1px solid #ddd;
          padding-top: 20px;
        }
        .date {
          font-style: italic;
        }
          </style>
        </head>
        <body>
          <div class="header">
        <div class="title">Your Personalized Diet Plan</div>
        <div class="subtitle">Tailored specifically to your body and goals</div>
          </div>
          
          <div class="user-info">
        <p><strong>Height:</strong> ${formData.height} cm</p>
        <p><strong>Weight:</strong> ${formData.weight} kg</p>
        <p><strong>Age:</strong> ${formData.age} years</p>
        <p><strong>Gender:</strong> ${
          formData.gender === "male" ? "Male" : "Female"
        }</p>
        <p><strong>Goal:</strong> ${goalText}</p>
        <p><strong>Dietary Restrictions:</strong> ${restrictions}</p>
          </div>
          
          <div class="section">
        <div class="section-title">Daily Caloric Needs</div>
        <div class="calories">${aiResponse?.calorieNeeds || 0} calories</div>
          </div>
          
          <div class="section">
        <div class="section-title">Recommended Macronutrients</div>
        <div class="macros">
          <div class="macro-card protein">
            <div class="macro-title">Protein</div>
            <div class="macro-value">${aiResponse?.macros.protein || 30}%</div>
          </div>
          <div class="macro-card carbs">
            <div class="macro-title">Carbs</div>
            <div class="macro-value">${aiResponse?.macros.carbs || 40}%</div>
          </div>
          <div class="macro-card fats">
            <div class="macro-title">Fats</div>
            <div class="macro-value">${aiResponse?.macros.fats || 30}%</div>
          </div>
        </div>
          </div>
          
          <div class="section">
        <div class="section-title">Sample Meal Plan</div>
        
        <div class="meal-section">
          <div class="meal-title">Breakfast</div>
          <div class="meal-content">${
            aiResponse?.mealPlan.breakfast ||
            "Oatmeal with berries and nuts, Greek yogurt"
          }</div>
        </div>
        
        <div class="meal-section">
          <div class="meal-title">Lunch</div>
          <div class="meal-content">${
            aiResponse?.mealPlan.lunch ||
            "Grilled chicken salad with mixed vegetables"
          }</div>
        </div>
        
        <div class="meal-section">
          <div class="meal-title">Dinner</div>
          <div class="meal-content">${
            aiResponse?.mealPlan.dinner ||
            "Baked salmon with quinoa and steamed broccoli"
          }</div>
        </div>
        
        <div class="meal-section">
          <div class="meal-title">Snacks</div>
          <div class="meal-content">${
            aiResponse?.mealPlan.snacks ||
            "Apple with almond butter, protein shake"
          }</div>
        </div>
          </div>
          
          <div class="section">
        <div class="section-title">Personalized Recommendations</div>
        <div class="recommendations">
          <ul>
            ${
              aiResponse?.recommendations
                .map((rec) => `<li>${rec}</li>`)
                .join("") ||
              `
            <li>Stay hydrated by drinking at least 8 glasses of water daily</li>
            <li>Focus on whole, unprocessed foods</li>
            <li>Include a variety of colorful vegetables in your meals</li>
            `
            }
          </ul>
        </div>
          </div>
          
          <div class="footer">
        <p>This diet plan is generated based on your personal metrics and goals. Consult with a healthcare professional before making significant dietary changes.</p>
        <p class="date">Generated on: ${new Date().toLocaleDateString(
          "en-GB"
        )}</p>
          </div>
        </body>
        </html>
      `);

      WinPrint.document.close();
      WinPrint.focus();

      // Print with slight delay to ensure styles are loaded
      setTimeout(() => {
        WinPrint.print();
        WinPrint.close();
      }, 500);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-white py-16 border-b-4 border-black">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-black mb-6">Personalized Diet Coach</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Get a customized nutrition plan based on your body metrics,
            lifestyle, and health goals.
          </p>
        </div>
      </section>

      <section className="py-16 justify-center">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="neo-brutalist-card p-8 bg-white border-4 border-black shadow-lg">
              {!showResults ? (
                <form onSubmit={handleSubmit}>
                  <h2 className="text-2xl font-bold mb-6 border-b-2 border-black pb-2">
                    Your Information
                  </h2>

                  <div className="space-y-6">
                    <div>
                      <label htmlFor="height" className="block font-bold mb-2">
                        Height (cm)
                      </label>
                      <input
                        type="range"
                        id="height"
                        name="height"
                        min="120"
                        max="220"
                        value={formData.height}
                        onChange={handleChange}
                        className="w-full"
                      />
                      <div className="flex justify-between mt-1">
                        <span>120 cm</span>
                        <span className="font-bold">{formData.height} cm</span>
                        <span>220 cm</span>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="weight" className="block font-bold mb-2">
                        Weight (kg)
                      </label>
                      <input
                        type="range"
                        id="weight"
                        name="weight"
                        min="40"
                        step={1}
                        max="150"
                        value={formData.weight}
                        onChange={handleChange}
                        className="w-full"
                      />
                      <div className="flex justify-between mt-1">
                        <span>40 kg</span>
                        <span className="font-bold">{formData.weight} kg</span>
                        <span>150 kg</span>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="age" className="block font-bold mb-2">
                        Age
                      </label>
                      <input
                        type="range"
                        id="age"
                        name="age"
                        min="18"
                        max="80"
                        value={formData.age}
                        onChange={handleChange}
                        className="w-full"
                      />
                      <div className="flex justify-between mt-1">
                        <span>18</span>
                        <span className="font-bold">{formData.age} years</span>
                        <span>80</span>
                      </div>
                    </div>
                    <div>
                      <label className="block font-bold mb-2" htmlFor="gender">
                        Gender
                      </label>
                      <select
                        id="gender"
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="neo-brutalist-input w-full p-2 border-2 border-black"
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="goal" className="block font-bold mb-2">
                        Goal
                      </label>
                      <select
                        id="goal"
                        name="goal"
                        value={formData.goal}
                        onChange={handleChange}
                        className="neo-brutalist-input w-full p-2 border-2 border-black"
                      >
                        <option value="lose">Lose Weight</option>
                        <option value="maintain">Maintain Weight</option>
                        <option value="gain">Gain Weight</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold mb-2">
                        Dietary Restrictions
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          "Vegetarian",
                          "Vegan",
                          "Gluten-Free",
                          "Dairy-Free",
                          "Nut Allergy",
                          "Shellfish Allergy",
                        ].map((restriction) => (
                          <label
                            key={restriction}
                            className="flex items-center"
                          >
                            <input
                              type="checkbox"
                              name="dietaryRestrictions"
                              value={restriction}
                              checked={formData.dietaryRestrictions.includes(
                                restriction
                              )}
                              onChange={handleCheckboxChange}
                              className="mr-2"
                            />
                            {restriction}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="neo-brutalist-button mt-8 w-full py-3 bg-black text-white font-bold text-lg border-2 border-black hover:bg-gray-800 transition-colors"
                    disabled={isLoading}
                  >
                    {isLoading
                      ? "Generating Your Plan..."
                      : "Get Your AI-Powered Diet Plan"}
                  </button>
                </form>
              ) : (
                <div id="printSection">
                  <div className="flex justify-between items-center mb-6 border-b-2 border-black pb-2">
                    <h2 className="text-2xl font-bold">Your Diet Plan</h2>
                    <div className="flex space-x-2">
                      <button
                        onClick={handlePrint}
                        className="text-sm font-medium px-3 py-1 border-2 border-black hover:bg-gray-100"
                      >
                        Print Plan
                      </button>
                      <button
                        onClick={() => setShowResults(false)}
                        className="text-sm font-medium px-3 py-1 border-2 border-black hover:bg-gray-100"
                      >
                        Back to Form
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-100 border-2 border-red-400 text-red-700 p-3 mb-4 rounded">
                      {error}
                    </div>
                  )}

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-bold mb-2">
                        Daily Caloric Needs
                      </h3>
                      <div className="neo-brutalist-card p-4 bg-yellow-100 border-2 border-black">
                        <p className="text-2xl font-bold text-center">
                          {aiResponse?.calorieNeeds || 0} calories
                        </p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold mb-2">
                        Recommended Macronutrients
                      </h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="neo-brutalist-card p-4 text-center border-2 border-black bg-green-100">
                          <p className="font-bold">Protein</p>
                          <p className="text-xl mt-2">
                            {aiResponse?.macros.protein || 30}%
                          </p>
                        </div>
                        <div className="neo-brutalist-card p-4 text-center border-2 border-black bg-blue-100">
                          <p className="font-bold">Carbs</p>
                          <p className="text-xl mt-2">
                            {aiResponse?.macros.carbs || 40}%
                          </p>
                        </div>
                        <div className="neo-brutalist-card p-4 text-center border-2 border-black bg-red-100">
                          <p className="font-bold">Fats</p>
                          <p className="text-xl mt-2">
                            {aiResponse?.macros.fats || 30}%
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold mb-2">
                        Sample Meal Plan
                      </h3>
                      <div className="space-y-3">
                        <div className="neo-brutalist-card p-4 border-2 border-black">
                          <p className="font-bold">Breakfast</p>
                          <p>
                            {aiResponse?.mealPlan.breakfast ||
                              "Oatmeal with berries and nuts, Greek yogurt"}
                          </p>
                        </div>
                        <div className="neo-brutalist-card p-4 border-2 border-black">
                          <p className="font-bold">Lunch</p>
                          <p>
                            {aiResponse?.mealPlan.lunch ||
                              "Grilled chicken salad with mixed vegetables"}
                          </p>
                        </div>
                        <div className="neo-brutalist-card p-4 border-2 border-black">
                          <p className="font-bold">Dinner</p>
                          <p>
                            {aiResponse?.mealPlan.dinner ||
                              "Baked salmon with quinoa and steamed broccoli"}
                          </p>
                        </div>
                        <div className="neo-brutalist-card p-4 border-2 border-black">
                          <p className="font-bold">Snacks</p>
                          <p>
                            {aiResponse?.mealPlan.snacks ||
                              "Apple with almond butter, protein shake"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold mb-2">
                        Personalized Recommendations
                      </h3>
                      <div className="neo-brutalist-card p-4 border-2 border-black bg-purple-50">
                        <ul className="list-disc pl-5 space-y-2">
                          {aiResponse?.recommendations.map((rec, index) => (
                            <li key={index}>{rec}</li>
                          )) || (
                            <>
                              <li>
                                Stay hydrated by drinking at least 8 glasses of
                                water daily
                              </li>
                              <li>Focus on whole, unprocessed foods</li>
                              <li>
                                Include a variety of colorful vegetables in your
                                meals
                              </li>
                            </>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
