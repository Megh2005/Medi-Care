"use client";

import { LoaderCircle, NotepadText } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { ethers } from "ethers";
import marketplace from "@/lib/marketplace.json";
import { WalletContext } from "@/context/Wallet";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";

interface PrescriptionResult {
  description: string;
  image: string;
  name: string;
}

const ProfileRecords = () => {
  const [selectedTab, setSelectedTab] = useState<"prescriptions" | "diet">(
    "diet"
  );
  const [loading, setLoading] = useState(false);
  const [onChainDocuments, setOnChainDocuments] = useState<
    PrescriptionResult[]
  >([]);
  const { signer, isConnected } = useContext(WalletContext);

  async function getNFTitems() {
    const itemsArray = [];
    if (!signer) return;
    const contract = new ethers.Contract(
      marketplace.address,
      marketplace.abi,
      signer
    );

    setLoading(true);

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
    setOnChainDocuments(itemsArray);
    setLoading(false);
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
            On Chain Documents
          </button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-3xl max-h-[600px] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-red-600">
              On Chain Documents
            </DialogTitle>
          </DialogHeader>
          {!isConnected && (
            <p className="text-center font-bold text-sm">Connect your Wallet</p>
          )}
          {loading && (
            <div className="flex items-center justify-center">
              <LoaderCircle className="animate-spin text-red-500" size={16} />
            </div>
          )}
          {!loading && isConnected && onChainDocuments.length === 0 && (
            <p className="text-center font-bold text-sm">
              No On Chain Documents Found
            </p>
          )}
          <div>
            {onChainDocuments.map((prescription, index) => (
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
                      <h3 className="text-xl font-bold">{prescription.name}</h3>
                      <p className="text-sm text-gray-500">
                        {prescription.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfileRecords;
