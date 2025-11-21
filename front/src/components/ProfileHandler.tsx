"use client";

import { useState } from "react";
import ProfileEditForm from "@/src/components/ProfileEditForm";
import ProfileView from "@/src/components/ProfileView";
import ProfileEditButton from "./ProfileEditButton";
import BandButton from "./BandButton";
import VacanciesButton from "./VacanciesButton";

export default function ProfilePage() {
  const [isProfileEditFormOpen, setIsProfileEditFormOpen] = useState(false);

  const toggleProfileEditForm = () => {
    setIsProfileEditFormOpen((prev) => !prev);
    
  };

  return (
    <div className="p-4 mt-24">

      <div className="flex flex-row justify-between max-w-7xl items-center mx-auto mb-5">
        <span className="flex flex-row gap-5 ">
          <BandButton/>
          <VacanciesButton/>
        </span>
      <button
        onClick={toggleProfileEditForm}
        className="sx-fd0de145dd41e0c2 inline-block px-8 py-4 bg-gradient-to-r border from-oscuro1 to-oscuro2 text-txt1 font-bold text-lg rounded-xl cursor-pointer hover:from-oscuro2 hover:to-oscuro1 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
        {isProfileEditFormOpen ? "Cerrar edición" : "Editar perfil"}
      </button>
      </div>
      {!isProfileEditFormOpen && <ProfileView />}

      {isProfileEditFormOpen && (
        <ProfileEditButton isOpen={isProfileEditFormOpen}>
          <ProfileEditForm />
        </ProfileEditButton>
      )}

    </div>
  );
}
