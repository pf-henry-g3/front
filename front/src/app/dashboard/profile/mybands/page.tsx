"use client"
import { useState } from "react";
import BandForm from "@/src/components/BandForm";
import MyBandsList from "@/src/components/MyBandsList";
import BandAddMemberForm from "@/src/components/BandAddMemberForm";
import { useRouter } from "next/navigation";

export default function MyBands() {
  const router = useRouter
  const [refreshKey, setRefreshKey] = useState(0);

  const handleBandCreated = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="mt-24">
      <MyBandsList refreshTrigger={refreshKey} />
      <BandForm onBandCreated={handleBandCreated} />
      <BandAddMemberForm />
    </div>
  );
}