"use client"
import axios from "axios";
import { useEffect, useState, useCallback, useMemo } from "react";
import Pagination from "./Pagination";
import Review from "./Review";

import { reviewsMock } from "../mocks/ReviewsMock";

interface Reviews {
  score: number;
  reviewDescription: string;
  urlImage: string;
}

interface ReviewProps {
  id: string,
  userName: string,
  userImage: string,
  reviewDescription: string,
  score: number,
}


export default function ReviewsList () {
  const [userRole, setUserRole] = useState(null);

  const [reviews, setReviews] = useState<Reviews[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(3);

  useEffect(() => {
    async function fetchUserRole() {
      const base = (process.env.NEXT_PUBLIC_API_URL ?? process.env.NEXT_PUBLIC_BACKEND_URL ?? '').replace(/\/+$/, '');
      const res = await axios.get(`${base}/user`); 
      setUserRole(res.data?.data?.userRole ?? null);
    }

    fetchUserRole();
  }, []);


  useEffect(() => {
    if (!userRole) return;
    async function fetchReviews() {
      const base = (process.env.NEXT_PUBLIC_API_URL ?? process.env.NEXT_PUBLIC_BACKEND_URL ?? '').replace(/\/+$/, '');
      const res = await axios.get(`${base}/review/${userRole}`); 
      setReviews(res.data.data.reviews || []);
    }

    fetchReviews();
  }, [userRole]);

  const paginationData = useMemo(() => {
      const totalPages = Math.ceil(reviews.length / itemsPerPage);
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedItems = reviews.slice(startIndex, endIndex);
  
      return {
        totalPages,
        paginatedItems,
        totalItems: reviews.length
      };
    }, [reviews, currentPage, itemsPerPage]);
  
    const handlePageChange = useCallback((page: number) => {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);
  
    const handleItemsPerPageChange = useCallback((newItemsPerPage: number) => {
      setItemsPerPage(newItemsPerPage);
      setCurrentPage(1);
    }, []);

  return (
    <div className="p-4"> 
      {paginationData.paginatedItems.length > 0 ? (
        <div className="p-4 space-y-3">
          {paginationData.paginatedItems.map((review) => (
            <Review
              key={review.id}
              {...review}
            />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <p className="text-oscuro3 text-lg mb-2 font-bold">
              No se encontraron resultados
            </p>
            <p className="text-tur2 text-sm font-medium">
              Este usuario aún no ha recibido una reseña
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <p className="text-txt1 text-lg font-bold">
              No hay elementos en esta página
            </p>
          </div>
        </div>
      )}

      {/* TEST inicio*/}
      {reviewsMock.length > 0 ? (
        <div className="p-4 space-y-3">
          {reviewsMock.map((review) => (
            <Review
            key={review.id}
            {...review}
            />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <p className="text-verde text-lg mb-2 font-bold">
              No se encontraron resultados
            </p>
            <p className="text-tur2 text-sm font-medium">
              Este usuario aún no ha recibido una reseña
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <p className="text-txt1 text-lg font-bold">
              No hay elementos en esta página
            </p>
          </div>
        </div>
      )}
      {/*TEST final*/}
      
      <div>
        {reviews.length > 0 && (
          <div className="px-4 pb-4 mx-auto">
            <Pagination
              currentPage={currentPage}
              totalPages={paginationData.totalPages}
              totalItems={paginationData.totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}