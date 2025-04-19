/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type React from "react";

import { useState } from "react";
import { Upload, X, Check, AlertTriangle, Info, Pill } from "lucide-react";
import Image from "next/image";

interface MedicationInfo {
  name: string;
  composition: string;
  dosage: string;
  frequency: string;
  duration: string;
  purpose: string;
  sideEffects: string[];
  warnings: string[];
  simplifiedExplanation?: string;
}

interface DoctorInfo {
  name: string;
  specialty: string;
  license: string;
}

interface PatientInfo {
  name: string;
  id: string;
  date: string;
}

export interface PrescriptionResults {
  medications: MedicationInfo[];
  doctor: DoctorInfo;
  patient: PatientInfo;
}

// Common medication information database
const medicationDatabase: Record<
  string,
  {
    commonUses: string[];
    simplifiedExplanation: string;
    commonSideEffects: string[];
    commonWarnings: string[];
  }
> = {
  // Antibiotics
  amoxicillin: {
    commonUses: [
      "Bacterial infections",
      "Respiratory infections",
      "Ear infections",
      "Urinary tract infections",
    ],
    simplifiedExplanation:
      "An antibiotic that fights bacteria in your body by preventing them from building cell walls, which they need to survive.",
    commonSideEffects: [
      "Nausea",
      "Vomiting",
      "Diarrhea",
      "Rash",
      "Stomach pain",
    ],
    commonWarnings: [
      "Take the full course even if you feel better",
      "May cause allergic reactions",
      "Take with food to reduce stomach upset",
      "Tell your doctor if you have any allergies to penicillin",
    ],
  },
  ciprofloxacin: {
    commonUses: [
      "Urinary tract infections",
      "Skin infections",
      "Respiratory infections",
      "Bone and joint infections",
    ],
    simplifiedExplanation:
      "An antibiotic that stops bacteria from multiplying by preventing them from copying their DNA.",
    commonSideEffects: [
      "Nausea",
      "Diarrhea",
      "Headache",
      "Dizziness",
      "Tendon pain",
    ],
    commonWarnings: [
      "Avoid sunlight exposure",
      "Take with plenty of water",
      "Don't take with dairy products",
      "May cause tendon damage",
      "Not recommended for children",
    ],
  },
  azithromycin: {
    commonUses: [
      "Respiratory infections",
      "Skin infections",
      "Ear infections",
      "Sexually transmitted infections",
    ],
    simplifiedExplanation:
      "An antibiotic that stops bacteria from growing by interfering with their protein production.",
    commonSideEffects: ["Diarrhea", "Stomach pain", "Nausea", "Headache"],
    commonWarnings: [
      "May cause heart rhythm problems",
      "Take on an empty stomach",
      "Don't take with antacids",
      "Finish the full course even if you feel better",
    ],
  },

  // Pain relievers
  ibuprofen: {
    commonUses: [
      "Pain relief",
      "Inflammation",
      "Fever reduction",
      "Menstrual cramps",
    ],
    simplifiedExplanation:
      "A pain reliever that works by reducing hormones that cause inflammation and pain in your body.",
    commonSideEffects: [
      "Stomach upset",
      "Heartburn",
      "Dizziness",
      "Mild headache",
    ],
    commonWarnings: [
      "Don't take on an empty stomach",
      "Avoid alcohol",
      "May increase risk of heart attack or stroke",
      "Not recommended for long-term use without doctor supervision",
    ],
  },
  acetaminophen: {
    commonUses: ["Pain relief", "Fever reduction", "Headaches", "Muscle aches"],
    simplifiedExplanation:
      "A pain reliever that works by blocking pain signals in your brain.",
    commonSideEffects: ["Rare when taken as directed", "Nausea", "Rash"],
    commonWarnings: [
      "Don't exceed recommended dose",
      "Liver damage can occur with excessive use",
      "Avoid alcohol",
      "May be in other medications, so check combinations carefully",
    ],
  },
  naproxen: {
    commonUses: [
      "Pain relief",
      "Inflammation",
      "Arthritis",
      "Menstrual cramps",
    ],
    simplifiedExplanation:
      "A pain reliever that reduces substances in the body that cause inflammation and pain.",
    commonSideEffects: [
      "Stomach upset",
      "Heartburn",
      "Drowsiness",
      "Dizziness",
    ],
    commonWarnings: [
      "Take with food",
      "Avoid alcohol",
      "May increase risk of heart attack or stroke",
      "May cause stomach bleeding",
    ],
  },

  // Blood pressure medications
  lisinopril: {
    commonUses: [
      "High blood pressure",
      "Heart failure",
      "Kidney protection",
      "After heart attack",
    ],
    simplifiedExplanation:
      "A medication that relaxes blood vessels, making it easier for your heart to pump blood through your body.",
    commonSideEffects: ["Dry cough", "Dizziness", "Headache", "Fatigue"],
    commonWarnings: [
      "May cause dizziness when standing up",
      "Can harm an unborn baby",
      "Don't use salt substitutes",
      "Monitor your blood pressure regularly",
    ],
  },
  amlodipine: {
    commonUses: [
      "High blood pressure",
      "Chest pain (angina)",
      "Coronary artery disease",
    ],
    simplifiedExplanation:
      "A medication that relaxes blood vessels so blood can flow more easily, reducing the work your heart has to do.",
    commonSideEffects: [
      "Swelling in ankles or feet",
      "Flushing",
      "Headache",
      "Dizziness",
    ],
    commonWarnings: [
      "May cause dizziness",
      "Don't stop taking suddenly",
      "Avoid grapefruit juice",
      "Tell doctor if swelling becomes severe",
    ],
  },

  // Diabetes medications
  metformin: {
    commonUses: [
      "Type 2 diabetes",
      "Prediabetes",
      "Polycystic ovary syndrome (PCOS)",
    ],
    simplifiedExplanation:
      "A medication that helps control blood sugar by improving how your body responds to insulin and reducing sugar produced by your liver.",
    commonSideEffects: [
      "Stomach upset",
      "Diarrhea",
      "Nausea",
      "Metallic taste",
    ],
    commonWarnings: [
      "Take with meals",
      "Start with low dose to minimize side effects",
      "Don't drink excessive alcohol",
      "May need to be temporarily stopped before certain medical procedures",
    ],
  },

  // Allergy medications
  loratadine: {
    commonUses: ["Allergies", "Hay fever", "Hives", "Runny nose"],
    simplifiedExplanation:
      "An antihistamine that reduces the effects of histamine, a natural substance that causes allergy symptoms.",
    commonSideEffects: [
      "Headache",
      "Drowsiness (rare)",
      "Dry mouth",
      "Fatigue",
    ],
    commonWarnings: [
      "Less drowsiness than other antihistamines",
      "May still affect alertness",
      "Avoid alcohol",
      "Tell doctor about any other medications you're taking",
    ],
  },
  cetirizine: {
    commonUses: ["Allergies", "Hay fever", "Hives", "Itchy skin"],
    simplifiedExplanation:
      "An antihistamine that blocks the effects of histamine, which causes allergy symptoms.",
    commonSideEffects: ["Drowsiness", "Dry mouth", "Fatigue", "Headache"],
    commonWarnings: [
      "May cause drowsiness",
      "Avoid alcohol",
      "Don't drive until you know how it affects you",
      "Tell doctor about other medications",
    ],
  },

  // Default for unknown medications
  default: {
    commonUses: [
      "Treatment of medical conditions as prescribed by your doctor",
    ],
    simplifiedExplanation:
      "This medication is prescribed for specific health conditions. Always follow your doctor's instructions.",
    commonSideEffects: [
      "Side effects vary - consult medication information leaflet",
      "Report any unusual symptoms to your doctor",
    ],
    commonWarnings: [
      "Take as directed by your doctor",
      "Don't stop taking without consulting your doctor",
      "Keep out of reach of children",
      "Check for interactions with other medications you take",
    ],
  },
};

// Function to find medication info from database (case insensitive)
export const getMedicationInfo = (medicationName: string) => {
  const normalizedName = medicationName.toLowerCase().trim();

  // Check for exact matches first
  for (const [key, value] of Object.entries(medicationDatabase)) {
    if (normalizedName === key.toLowerCase()) {
      return value;
    }
  }

  // Then check for partial matches
  for (const [key, value] of Object.entries(medicationDatabase)) {
    if (
      normalizedName.includes(key.toLowerCase()) ||
      key.toLowerCase().includes(normalizedName)
    ) {
      return value;
    }
  }

  // Return default if no match found
  return medicationDatabase.default;
};

export default function PrescriptionScannerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [results, setResults] = useState<PrescriptionResults | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showMedicalTerms, setShowMedicalTerms] = useState<boolean>(true);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);

      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreview(event.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);

      // Reset results and error
      setResults(null);
      setError(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      setFile(droppedFile);

      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreview(event.target?.result as string);
      };
      reader.readAsDataURL(droppedFile);

      // Reset results and error
      setResults(null);
      setError(null);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreview(null);
    setResults(null);
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setIsLoading(true);
    setError(null);

    try {
      // Convert the image to base64
      const base64Image = await convertFileToBase64(file);
      const imageData = base64Image.split(",")[1]; // Remove the data URL prefix

      const response = await fetch("/api/prescription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageData,
          fileType: file.type,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error with status: ${response.status}`);
      }

      const data = await response.json();

      // Extract the text content from the Gemini response
      const jsonStr = data;

      // Parse the extracted JSON
      const parsedResults = JSON.parse(jsonStr.trim());

      // Enhance the results with additional information and plain language explanations
      const enhancedResults = enhanceMedicationInfo(parsedResults);

      // Set the results
      setResults(enhancedResults);
    } catch (err) {
      console.error("Error analyzing prescription:", err);
      setError(
        "Failed to analyze the prescription. Please try again with a clearer image."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to convert File to base64
  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Function to enhance medication information with plain language explanations
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

  return (
    <div className="min-h-screen bg-[#f8f5f2]">
      {/* Header */}
      <section className="bg-white py-16 border-b-4 border-black">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-black mb-6">Prescription Scanner</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Upload your prescription and get detailed information about your
            medications, potential side effects, and important warnings - all
            explained in simple, easy-to-understand language.
          </p>
        </div>
      </section>

      {/* Upload Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Upload Area */}
            <div>
              <div
                className={`neo-brutalist-card p-8 ${
                  !file ? "border-dashed" : ""
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                {!file ? (
                  <div className="text-center py-12">
                    <Upload className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                    <h2 className="text-xl font-bold mb-2">
                      Upload Your Prescription
                    </h2>
                    <p className="mb-6 text-gray-600">
                      Drag and drop your prescription image here, or click to
                      browse
                    </p>
                    <label className="neo-brutalist-button cursor-pointer inline-block">
                      <span>Browse Files</span>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </label>
                    <p className="mt-4 text-sm text-gray-500">
                      Supported formats: JPG, PNG, PDF
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-bold">Prescription Image</h2>
                      <button
                        onClick={handleRemoveFile}
                        className="p-2 border-2 border-black hover:bg-gray-100"
                        aria-label="Remove file"
                      >
                        <X size={20} />
                      </button>
                    </div>

                    <div className="relative h-[300px] neo-brutalist-card p-2 mb-4">
                      {preview && (
                        <Image
                          src={preview || "/placeholder.svg"}
                          alt="Prescription preview"
                          fill
                          className="object-contain"
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p>
                          {file.name.length > 15
                            ? `${file.name.substring(0, 12)}...`
                            : file.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>

                      <button
                        onClick={handleAnalyze}
                        className={`neo-brutalist-button ${
                          isLoading ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                        disabled={isLoading}
                      >
                        {isLoading ? "Analyzing..." : "Analyze"}
                      </button>
                    </div>

                    {error && (
                      <div className="mt-4 p-3 bg-red-50 border-2 border-red-300 text-red-700">
                        <div className="flex items-start">
                          <AlertTriangle className="text-red-500 mr-2 mt-1 flex-shrink-0" />
                          <p>{error}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-8 neo-brutalist-card p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center">
                  <Info className="mr-2 text-primary" />
                  How It Works
                </h3>
                <ol className="space-y-3 list-decimal pl-5">
                  <li>Upload a clear image of your prescription</li>
                  <li>Our AI analyzes the medication details</li>
                  <li>Medical terms are translated into simple language</li>
                  <li>Get comprehensive information about your medications</li>
                  <li>Understand potential side effects and warnings</li>
                </ol>
              </div>
            </div>

            {/* Results Area */}
            <div>
              {isLoading ? (
                <div className="neo-brutalist-card p-8">
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-black mx-auto mb-4"></div>
                    <h2 className="text-xl font-bold mb-2">
                      Analyzing Prescription
                    </h2>
                    <p className="text-gray-600">
                      This may take a few moments...
                    </p>
                  </div>
                </div>
              ) : results ? (
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
                            showMedicalTerms ? "translate-x-6" : "translate-x-1"
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
                        <strong>Name:</strong> {results.patient.name}
                      </p>
                      <p>
                        <strong>Date:</strong> {results.patient.date}
                      </p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-lg font-bold mb-2">Prescribed By</h3>
                    <div className="neo-brutalist-card p-4 bg-gray-50">
                      <p>
                        <strong>Doctor:</strong> {results.doctor.name}
                      </p>
                      <p>
                        <strong>Specialty:</strong> {results.doctor.specialty}
                      </p>
                      <p></p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold mb-2">
                      Medications ({results.medications.length})
                    </h3>
                    <div className="space-y-4">
                      {results.medications.map((med, index) => (
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
              ) : (
                <div className="neo-brutalist-card p-8">
                  <h2 className="text-2xl font-bold mb-4">
                    Benefits of Prescription Analysis
                  </h2>
                  <ul className="space-y-4">
                    {[
                      {
                        icon: <Check className="text-green-500" />,
                        title: "Plain Language Explanations",
                        description:
                          "Medical terms translated into simple, easy-to-understand language.",
                      },
                      {
                        icon: <Check className="text-green-500" />,
                        title: "Medication Understanding",
                        description:
                          "Get clear information about what each medication is for and how to take it properly.",
                      },
                      {
                        icon: <Check className="text-green-500" />,
                        title: "Side Effect Awareness",
                        description:
                          "Know potential side effects to watch for and when to contact your doctor.",
                      },
                      {
                        icon: <Check className="text-green-500" />,
                        title: "Warning Highlights",
                        description:
                          "Important warnings and precautions clearly highlighted for your safety.",
                      },
                      {
                        icon: <Check className="text-green-500" />,
                        title: "Digital Record",
                        description:
                          "Keep a digital record of your prescriptions for future reference.",
                      },
                    ].map((benefit, index) => (
                      <li key={index} className="flex items-start">
                        <div className="mr-3 mt-1">{benefit.icon}</div>
                        <div>
                          <h3 className="font-bold">{benefit.title}</h3>
                          <p>{benefit.description}</p>
                        </div>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8 p-4 bg-blue-50 border-2 border-blue-300">
                    <div className="flex items-start">
                      <Info className="text-blue-500 mr-3 mt-1 flex-shrink-0" />
                      <p>
                        <strong>Privacy Note:</strong> All prescription data is
                        processed securely. We do not store your prescription
                        images unless you explicitly choose to save them to your
                        account.
                      </p>
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
