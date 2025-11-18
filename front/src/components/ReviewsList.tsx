"use client"
import axios from "axios";
import { useEffect, useState } from "react";

interface UserRole {
  name: string;
}

interface Reviews {
  score: number;
  reviewDescription: string;
  urlImage: string;
}

export default function ReviewsList () {
  const [userRole, setUserRole] = useState<UserRole>();
  
  const [reviews, setReviews] = useState<Reviews[]>([]);

  useEffect(() => {
    async function fetchUserRole() {
      const base = (process.env.NEXT_PUBLIC_API_URL ?? process.env.NEXT_PUBLIC_BACKEND_URL ?? '').replace(/\/+$/, '');
      const res = await axios.get(`${base}/user`); 
      setUserRole(res.data.data.userRole || []);
    }

    fetchUserRole();
  }, []);


  useEffect(() => {
    async function fetchReviews() {
      const base = (process.env.NEXT_PUBLIC_API_URL ?? process.env.NEXT_PUBLIC_BACKEND_URL ?? '').replace(/\/+$/, '');
      const res = await axios.get(`${base}/review/receptor`); 
      setReviews(res.data.data.reviews || "");
    }

    fetchReviews();
  }, []);

  return (
    <div className="p-4 bg-red-500"> 
      {reviews.length > 0 ? (
        <div></div>
      ) : (
        <div></div>
      )
      }
    </div>
  );
}