"use client";
import axios from "axios";
import { useEffect, useState, useCallback, useMemo } from "react";
import Pagination from "./Pagination";
import Review from "./Review";
import { useRouter, useParams } from "next/navigation";

interface ReviewItem {
  id: string;
  userName: string;
  userImage: string;
  reviewDescription: string;
  score: number;
  date: string;
}

export default function ReviewsList() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(3);
  const [receptorUserName, setReceptorUserName] = useState<string | null>(null);

  const params = useParams();
  const userNameId = params.id as string;

  // === 1. Obtener userName del receptor ===
  useEffect(() => {
    if (!userNameId) return;

    const base = (
      process.env.NEXT_PUBLIC_API_URL ??
      process.env.NEXT_PUBLIC_BACKEND_URL ??
      ""
    ).replace(/\/+$/, "");

    axios
      .get(`${base}/user/${userNameId}`)
      .then((res) => {
        setReceptorUserName(res.data.data.userName);
      })
      .catch(console.error);
  }, [userNameId]);

  // === 2. Obtener reviews del receptor ===
  useEffect(() => {
    if (!receptorUserName) return;

    const base = (
      process.env.NEXT_PUBLIC_API_URL ??
      process.env.NEXT_PUBLIC_BACKEND_URL ??
      ""
    ).replace(/\/+$/, "");

    axios
      .get(`${base}/review`, {
        params: {
          role: "receptor",
          receptor: receptorUserName,
          page: 1,
          limit: 10,
        },
      })
      .then((res) => {
        const mapped = res.data.data.map((item: any) => ({
          id: item.id,
          userName: item.owner.userName,
          userImage: item.owner.urlImage,
          reviewDescription: item.reviewDescription,
          score: Number(item.score),
          date: item.date,
        }));

        setReviews(mapped);
      })
      .catch(console.error);
  }, [receptorUserName]);

  // === 3. Paginación ===
  const paginationData = useMemo(() => {
    const totalPages = Math.ceil(reviews.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedItems = reviews.slice(startIndex, startIndex + itemsPerPage);

    return {
      totalPages,
      paginatedItems,
      totalItems: reviews.length,
    };
  }, [reviews, currentPage, itemsPerPage]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
            <Review key={review.id} {...review} />
          ))}
        </div>
      ) : (
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
      )}

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
  );
}
