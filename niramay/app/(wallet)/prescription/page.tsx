/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type React from "react";

import { useCallback, useContext, useRef, useState } from "react";
import { Upload, X, Check, AlertTriangle, Info, Pill } from "lucide-react";
import Image from "next/image";
import { ethers } from "ethers";
import marketplace from "@/lib/marketplace.json";
import { toPng } from "html-to-image";
import toast from "react-hot-toast";
import { uploadFileToIPFS, uploadJSONToIPFS } from "@/utils/pinata";
import { WalletContext } from "@/context/Wallet";
import { getMedicationInfo } from "@/utils/getMedicationInfo";

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

export default function PrescriptionScannerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [results, setResults] = useState<PrescriptionResults | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showMedicalTerms, setShowMedicalTerms] = useState<boolean>(true);
  const ref = useRef<HTMLDivElement>(null);
  const [fileUrl, setFileUrl] = useState<string>("");
  const nftPrice = "1000";
  const name = `Prescription Certificate #${Date.now()}`;
  const description =
    "This NFT represents a digital certificate for the prescription scanned and analyzed using our AI technology.";

  const { signer, isConnected } = useContext(WalletContext);

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

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const handleRemoveFile = () => {
    setFile(null);
    setPreview(null);
    setResults(null);
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet to proceed.");
      return;
    }

    if (!file) return;

    setIsLoading(true);
    setError(null);

    try {
      // Convert the image to base64
      const base64Image = await convertFileToBase64(file);
      const imageData = base64Image.split(",")[1];

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
      const parsedResults = JSON.parse(data.trim());
      const enhancedResults = enhanceMedicationInfo(parsedResults);
      setResults(enhancedResults);

      // 2. Wait for DOM to render
      setTimeout(async () => {
        try {
          // Get the URL directly from the function return value
          const imageUrl = await captureAndUploadImageToIPFS();

          // Set the state for future reference
          if (imageUrl) {
            setFileUrl(imageUrl);

            // Pass the URL directly to listNFT
          } else {
            throw new Error("Failed to get image URL");
          }
        } catch (error) {
          console.error("Error in NFT creation process:", error);
          toast.error("Failed to create NFT");
        }
      }, 300); // enough delay to ensure rendering
    } catch (err) {
      console.error("Error analyzing prescription:", err);
      setError("Failed to analyze the prescription. Please try again.");
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

  const captureAndUploadImageToIPFS = async (): Promise<string | undefined> => {
    console.log("Capturing element:", ref.current);
    if (ref.current === null) return undefined;

    try {
      const dataUrl = await toPng(ref.current, { cacheBust: true });

      // Convert data URL to Blob
      const res = await fetch(dataUrl);
      const blob = await res.blob();

      console.log("Blob created:", blob);

      // Upload to IPFS
      const fd = new FormData();
      fd.append("file", blob, "prescription.png");

      const uploadPromise = uploadFileToIPFS(fd);
      toast.promise(
        uploadPromise,
        {
          loading: "Uploading Prescription...",
          success: "Prescription Uploaded Successfully",
          error: "Error uploading Prescription",
        },
        { duration: 5000 }
      );

      const response = await uploadPromise;

      console.log("IPFS upload response:", response);

      if (response.success === true) {
        console.log("Pinata URL obtained:", response.pinataURL);
        return response.pinataURL as string;
      }

      return undefined;
    } catch (error) {
      console.error("Error capturing and uploading certificate image:", error);
      return undefined;
    }
  };

  // Modified uploadMetadataToIPFS that takes the URL as a parameter
  const uploadMetadataWithUrl = async (
    imageUrl: string
  ): Promise<string | undefined> => {
    if (!name || !description || !imageUrl) {
      console.error("Missing required metadata fields");
      return undefined;
    }

    console.log("Uploading metadata with image URL:", imageUrl);

    const nftJSON = {
      name,
      description,
      price: nftPrice,
      image: imageUrl,
    };

    try {
      const response = await uploadJSONToIPFS(nftJSON);
      if (response.success === true) {
        console.log("Metadata uploaded successfully:", response.pinataURL);
        return response.pinataURL;
      }
      return undefined;
    } catch (e) {
      console.error("Error uploading JSON metadata:", e);
      throw e;
    }
  };

  // New function to list NFT with explicit URL parameter
  async function listNFTWithUrl(imageUrl: string) {
    if (!isConnected) {
      toast.error("Please connect your wallet to proceed.");
      return;
    }

    if (!signer) {
      toast.error("Signer not available");
      return;
    }

    try {
      const metadataURLPromise = uploadMetadataWithUrl(imageUrl);
      toast.promise(metadataURLPromise, {
        loading: "Uploading NFT Metadata...",
        success: "NFT Metadata Uploaded Successfully",
        error: "NFT Metadata Upload Failed",
      });

      const metadataURL = await metadataURLPromise;

      if (!metadataURL) {
        throw new Error("Failed to get metadata URL");
      }

      console.log("Metadata URL obtained:", metadataURL);

      const contract = new ethers.Contract(
        marketplace.address,
        marketplace.abi,
        signer
      );
      const price = ethers.parseEther(nftPrice);

      console.log(
        "Creating token with metadata:",
        metadataURL,
        "and price:",
        price.toString()
      );

      const transactionPromise = contract.createToken(metadataURL, price);
      toast.promise(transactionPromise, {
        loading: "Creating NFT...",
        success: "Transaction submitted",
        error: "Error creating NFT",
      });

      const transaction = await transactionPromise;
      console.log("Transaction submitted:", transaction.hash);

      const receiptPromise = transaction.wait();
      toast.promise(receiptPromise, {
        loading: "Waiting for transaction confirmation...",
        success: "NFT Listed Successfully",
        error: "Transaction failed",
      });

      await receiptPromise;
    } catch (e) {
      console.error("Error listing NFT:", e);
      toast.error("Failed to list NFT");
    }
  }

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
                      Supported formats: JPG, PNG
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
                <div ref={ref} className="neo-brutalist-card p-8">
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
                    <button
                      onClick={async () => {
                        await listNFTWithUrl(fileUrl);
                      }}
                      className="neo-brutalist-button bg-black text-white flex-1"
                    >
                      Mint Analysis
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
