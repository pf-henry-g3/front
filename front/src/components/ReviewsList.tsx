"use client"
import axios from "axios";
import { useEffect, useState, useCallback, useMemo } from "react";
import Pagination from "./Pagination";
import Review from "./Review";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import * as Yup from "yup";
import { reviewsMock } from "../mocks/ReviewsMock";

interface Reviews {
  score: number;
  reviewDescription: string;
  urlImage: string;
}

export default function ReviewsList () {


  const [reviews, setReviews] = useState<Reviews[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(3);

  const router = useRouter();

  const userRole = "receptor"
  



  useEffect(() => {
  async function fetchReviews() {
    if (!userRole) return;

    const token = localStorage.getItem("access_token");

    if (!token) {
      await Swal.fire({
        icon: "warning",
        title: "Sesión requerida",
        text: "Debes iniciar sesión para crear bandas",
        confirmButtonColor: "#F59E0B",
      });
      router.push("/login");
      return;
    }

    const base = (process.env.NEXT_PUBLIC_API_URL ?? process.env.NEXT_PUBLIC_BACKEND_URL ?? "").replace(/\/+$/, "");

    try {
      const res = await axios.get(`${base}/review`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        params: {
          role: "receptor",
          receptor: receptorUserName, 
          page: currentPage,
          limit: itemsPerPage,
        },
      });

      setReviews(res.data?.data?.reviews ?? []);
    } catch (err) {
      console.log(err);
    }
  }

  fetchReviews();
}, [userRole, currentPage, itemsPerPage, receptorUserName]);



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

  console.log(paginationData.paginatedItems)
  console.log(userRole )

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