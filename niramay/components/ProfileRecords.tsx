"use client";

import { NotepadText, Utensils } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { IDiet } from "@/models/dietModel";
import { ethers } from "ethers";
import marketplace from "@/lib/marketplace.json";
import { WalletContext } from "@/context/Wallet";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";

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

interface PrescriptionResult {
  description: string;
  image: string;
  name: string;
}

const ProfileRecords = () => {
  const [selectedTab, setSelectedTab] = useState<"prescriptions" | "diet">(
    "diet"
  );
  const [dietPlans, setDietPlans] = useState<Diet[]>([]);
  const [prescriptions, setPrescriptions] = useState<PrescriptionResult[]>([]);
  const { signer, isConnected } = useContext(WalletContext);

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
    fetchDietPlans();
  }, []);

  async function getNFTitems() {
    const itemsArray = [];
    if (!signer) return;
    const contract = new ethers.Contract(
      marketplace.address,
      marketplace.abi,
      signer
    );

    const transaction = await contract.getMyNFTs();
    console.log(transaction);

    for (const i of transaction) {
      const tokenId = parseInt(i.tokenId);
      const tokenURI = await contract.tokenURI(tokenId);
      const meta = (await axios.get(tokenURI)).data;
      const price = ethers.formatEther(i.price);

      console.log("meta: ", meta);
      console.log("i:", i);

      const item = {
        price,
        tokenId,
        seller: i.seller,
        owner: i.owner,
        image: meta.image,
        name: meta.name,
        description: meta.description,
      };

      itemsArray.push(item);
      //sumPrice += Number(price);
    }
    console.log(itemsArray);
    setPrescriptions(itemsArray);
  }

  useEffect(() => {
    if (!isConnected) return;
    getNFTitems();
  }, [isConnected]);

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
                    <div className="flex items-center gap-3">
                      <Link href={prescription.image} target="_blank">
                        <Image
                          src={prescription.image}
                          alt={prescription.name}
                          className="w-16 h-16 rounded-full"
                          width={64}
                          height={64}
                        />
                      </Link>
                      <div>
                        <h3 className="text-xl font-bold">
                          {prescription.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {prescription.description}
                        </p>
                      </div>
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
