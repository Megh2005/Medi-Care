"use client";

import { AlertTriangle, Info, NotepadText, Pill, Utensils } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { IDiet } from "@/models/dietModel";
import { IPrescription } from "@/models/prescriptionModel";
import {
  getMedicationInfo,
  PrescriptionResults,
} from "@/app/prescription/page";

type Diet = {
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

const ProfileRecords = () => {
  const [selectedTab, setSelectedTab] = useState<"prescriptions" | "diet">(
    "diet"
  );
  const [dietPlans, setDietPlans] = useState<Diet[]>([]);
  const [prescriptions, setPrescriptions] = useState<PrescriptionResults[]>([]);
  const [showMedicalTerms, setShowMedicalTerms] = useState<boolean>(true);

  const enhanceMedicationInfo = (
    results: PrescriptionResults
  ): PrescriptionResults => {
    const enhancedResults = { ...results };

    // Process each medication
    enhancedResults.medications = results.medications.map((medication) => {
      const medInfo = getMedicationInfo(medication.name);

      // Add simplified explanation
      const enhanced = {
        ...medication,
        simplifiedExplanation: medInfo.simplifiedExplanation,
      };

      // If purpose is missing or vague, use common uses
      if (
        !enhanced.purpose ||
        enhanced.purpose.toLowerCase().includes("unspecified") ||
        enhanced.purpose.toLowerCase().includes("not specified")
      ) {
        enhanced.purpose = medInfo.commonUses[0];
      }

      // Ensure we have side effects
      if (!enhanced.sideEffects || enhanced.sideEffects.length < 2) {
        enhanced.sideEffects = medInfo.commonSideEffects.slice(0, 3);
      }

      // Ensure we have warnings
      if (!enhanced.warnings || enhanced.warnings.length < 2) {
        enhanced.warnings = medInfo.commonWarnings.slice(0, 3);
      }

      return enhanced;
    });

    return enhancedResults;
  };

  useEffect(() => {
    async function fetchDietPlans() {
      const response = await fetch(`/api/diet`);
      const data = await response.json();

      const parsedData = data.map((item: IDiet) => {
        const parsedItem = JSON.parse(item.dietDescription);
        return {
          calorieNeeds: parsedItem.calorieNeeds,
          macros: parsedItem.macros,
          mealPlan: parsedItem.mealPlan,
          recommendations: parsedItem.recommendations,
        };
      });
      setDietPlans(parsedData);

      //setDietPlans(data);
    }
    async function fetchPrescriptions() {
      const response = await fetch(`/api/prescription`);
      const data = await response.json();

      const parsedData = data.map((item: IPrescription) => {
        const parsedResults = JSON.parse(item.prescriptionDescription.trim());
        const enhancedResults = enhanceMedicationInfo(parsedResults);

        return enhancedResults;
      });

      setPrescriptions(parsedData);
    }
    fetchDietPlans();
    fetchPrescriptions();
  }, []);

  return (
    <div className="flex gap-4">
      <Dialog>
        <DialogTrigger asChild>
          <button
            onClick={() => setSelectedTab("prescriptions")}
            className="px-4 py-2 font-bold bg-red-500 text-white border-2 border-black hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
          >
            <NotepadText size={16} />
            Prescriptions
          </button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-3xl max-h-[600px] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-red-600">
              {selectedTab === "diet" ? "Diet Plans" : "Prescriptions"}
            </DialogTitle>
          </DialogHeader>
          {selectedTab === "prescriptions" && (
            <div>
              {prescriptions.map((prescription, index) => (
                <div key={index} className="my-8">
                  <div className="neo-brutalist-card p-8">
                    <h2 className="text-2xl font-bold mb-6 border-b-2 border-black pb-2">
                      Prescription Analysis Results
                    </h2>

                    {/* Display Setting */}
                    <div className="mb-6 flex items-center justify-end">
                      <label className="flex items-center cursor-pointer">
                        <span className="mr-2 text-sm font-medium">
                          Simple Language
                        </span>
                        <div className="relative">
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={showMedicalTerms}
                            onChange={() =>
                              setShowMedicalTerms(!showMedicalTerms)
                            }
                          />
                          <div
                            className={`w-10 h-5 ${
                              showMedicalTerms ? "bg-green-600" : "bg-gray-200"
                            } rounded-full shadow-inner transition`}
                          ></div>
                          <div
                            className={`absolute w-3 h-3 bg-white rounded-full shadow top-1 transition-transform ${
                              showMedicalTerms
                                ? "translate-x-6"
                                : "translate-x-1"
                            }`}
                          ></div>
                        </div>
                      </label>
                    </div>

                    <div className="mb-6">
                      <h3 className="text-lg font-bold mb-2">
                        Patient Information
                      </h3>
                      <div className="neo-brutalist-card p-4 bg-gray-50">
                        <p>
                          <strong>Name:</strong> {prescription.patient.name}
                        </p>
                        <p>
                          <strong>Date:</strong> {prescription.patient.date}
                        </p>
                      </div>
                    </div>

                    <div className="mb-6">
                      <h3 className="text-lg font-bold mb-2">Prescribed By</h3>
                      <div className="neo-brutalist-card p-4 bg-gray-50">
                        <p>
                          <strong>Doctor:</strong> {prescription.doctor.name}
                        </p>
                        <p>
                          <strong>Specialty:</strong>{" "}
                          {prescription.doctor.specialty}
                        </p>
                        <p></p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold mb-2">
                        Medications ({prescription.medications.length})
                      </h3>
                      <div className="space-y-4">
                        {prescription.medications.map((med, index) => (
                          <div key={index} className="neo-brutalist-card p-4">
                            <div className="flex items-center mb-2">
                              <Pill className="text-primary mr-2" />
                              <h4 className="font-bold text-lg">{med.name}</h4>
                            </div>

                            {showMedicalTerms && med.simplifiedExplanation && (
                              <div className="mb-4 p-3 bg-blue-50 border-2 border-blue-200 rounded">
                                <div className="flex items-start">
                                  <Info className="text-blue-500 mr-2 mt-1 flex-shrink-0" />
                                  <p>{med.simplifiedExplanation}</p>
                                </div>
                              </div>
                            )}

                            <div className="grid grid-cols-2 gap-2 mb-3">
                              <p>
                                <strong>Dosage:</strong> {med.dosage}
                              </p>
                              <p>
                                <strong>Frequency:</strong> {med.frequency}
                              </p>
                            </div>

                            <p className="mb-3">
                              <strong>Composition:</strong> {med.composition}
                            </p>
                            <p className="mb-3">
                              <strong>Purpose:</strong> {med.purpose}
                            </p>

                            <div className="mb-3">
                              <p className="font-bold mb-1">Side Effects:</p>
                              <ul className="list-disc pl-5">
                                {med.sideEffects.map((effect, i) => (
                                  <li key={i}>{effect}</li>
                                ))}
                              </ul>
                            </div>

                            <div className="p-3 bg-yellow-50 border-2 border-yellow-400">
                              <div className="flex items-start">
                                <AlertTriangle className="text-yellow-600 mr-2 mt-1 flex-shrink-0" />
                                <div>
                                  <p className="font-bold mb-1">
                                    Important Warnings:
                                  </p>
                                  <ul className="list-disc pl-5">
                                    {med.warnings.map((warning, i) => (
                                      <li key={i}>{warning}</li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-6 flex gap-4">
                      <button className="neo-brutalist-button bg-black text-white flex-1">
                        Print Information
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog>
        <DialogTrigger asChild>
          <button
            onClick={() => setSelectedTab("diet")}
            className="px-4 py-2 font-bold bg-red-500 text-white border-2 border-black hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
          >
            <Utensils size={16} />
            Diet Plans
          </button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-3xl max-h-[600px] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-green-700">
              {selectedTab === "diet" ? "Diet Plans" : "Prescriptions"}
            </DialogTitle>
          </DialogHeader>
          {selectedTab === "diet" && (
            <div className="flex flex-col gap-4">
              {dietPlans.map((dietPlan, index) => (
                <div
                  key={index}
                  className="mb-8 pb-8 border-b-4 border-black last:border-none last:mb-0 last:pb-0"
                >
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-bold mb-2">
                        Daily Caloric Needs
                      </h3>
                      <div className="neo-brutalist-card p-4 bg-yellow-100 border-2 border-black">
                        <p className="text-2xl font-bold text-center">
                          {dietPlan?.calorieNeeds || 0} calories
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
                            {dietPlan?.macros.protein || 30}%
                          </p>
                        </div>
                        <div className="neo-brutalist-card p-4 text-center border-2 border-black bg-blue-100">
                          <p className="font-bold">Carbs</p>
                          <p className="text-xl mt-2">
                            {dietPlan?.macros.carbs || 40}%
                          </p>
                        </div>
                        <div className="neo-brutalist-card p-4 text-center border-2 border-black bg-red-100">
                          <p className="font-bold">Fats</p>
                          <p className="text-xl mt-2">
                            {dietPlan?.macros.fats || 30}%
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
                            {dietPlan?.mealPlan.breakfast ||
                              "Oatmeal with berries and nuts, Greek yogurt"}
                          </p>
                        </div>
                        <div className="neo-brutalist-card p-4 border-2 border-black">
                          <p className="font-bold">Lunch</p>
                          <p>
                            {dietPlan?.mealPlan.lunch ||
                              "Grilled chicken salad with mixed vegetables"}
                          </p>
                        </div>
                        <div className="neo-brutalist-card p-4 border-2 border-black">
                          <p className="font-bold">Dinner</p>
                          <p>
                            {dietPlan?.mealPlan.dinner ||
                              "Baked salmon with quinoa and steamed broccoli"}
                          </p>
                        </div>
                        <div className="neo-brutalist-card p-4 border-2 border-black">
                          <p className="font-bold">Snacks</p>
                          <p>
                            {dietPlan?.mealPlan.snacks ||
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
                          {dietPlan?.recommendations?.length > 0 ? (
                            dietPlan.recommendations.map((rec, idx) => (
                              <li key={idx}>{rec}</li>
                            ))
                          ) : (
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
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfileRecords;
