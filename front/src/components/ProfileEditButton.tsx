"use client"

import React from "react";

interface ProfileView {
  isOpen: boolean;
  children: React.ReactNode;
}

const ProfileEditButton: React.FC<ProfileView> = ({ isOpen, children }) => {
  if (!isOpen) return null;

  return (
    <div >
      <div onClick={(e) => e.stopPropagation()}>
        <div>{children}</div>
      </div>
    </div>
  );
}

export default ProfileEditButton