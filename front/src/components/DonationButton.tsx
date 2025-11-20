"use client"

import { useRouter } from "next/navigation";

export default function DonationButton() {
  const router = useRouter();

  return (
    <div className='flex items-center space-x-4'>
      <button
        className="text-md bg-azul py-1.5 px-4 rounded-md text-text2 font-sans shadow-xl transition duration-300 hover:bg-verde hover:text-txt1 hover:cursor-pointer flex items-center gap-2"
        onClick={() => { router.push("/donation"); }}
      >
        Dona aquí
      </button>
    </div>
  )
}