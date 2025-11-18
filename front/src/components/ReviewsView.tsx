"use client"

import React from "react";

interface ReviewsView {
  isOpen: boolean;
  children: React.ReactNode;
}

const ReviewsView: React.FC<ReviewsView> = ({ isOpen, children }) => {
  if (!isOpen) return null;

  return (
    <div className="bg-red-600" >
      <div onClick={(e) => e.stopPropagation()}>
        <div>{children}</div>
      </div>
    </div>
  );
}

export default ReviewsView