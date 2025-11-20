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

type SortCriterion = 'date' | 'score';
type SortOrder = 'asc' | 'desc';

export default function ReviewsList() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(3);
  const [receptorUserName, setReceptorUserName] = useState<string | null>(null);
  const [sortCriterion, setSortCriterion] = useState<SortCriterion>('date'); // Por defecto: fecha
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

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
    const sortedReviews = [...reviews].sort((a, b) => {
        let comparison = 0;
        if (sortCriterion === 'date') {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            comparison = dateB - dateA; // Descendente por fecha por defecto
        } else if (sortCriterion === 'score') {
            comparison = b.score - a.score; // Descendente por score por defecto
        }
        
        // Si la dirección es ascendente, invertir el resultado de la comparación
        return sortOrder === 'asc' ? -comparison : comparison;
    });
    
    // 2. Calcular paginación
    const totalPages = Math.ceil(sortedReviews.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedItems = sortedReviews.slice(startIndex, startIndex + itemsPerPage);

    return {
      totalPages,
      paginatedItems,
      totalItems: sortedReviews.length, 
    };
  }, [reviews, currentPage, itemsPerPage, sortCriterion, sortOrder]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleItemsPerPageChange = useCallback((newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  }, []);

    const handleSortByDate = useCallback(() => {
    if (sortCriterion === 'date') {
        setSortOrder(prevOrder => prevOrder === 'desc' ? 'asc' : 'desc');
    } else {
        setSortCriterion('date');
        setSortOrder('desc'); 
    }
    setCurrentPage(1);
  }, [sortCriterion]);

  const handleSortByScore = useCallback(() => {
    if (sortCriterion === 'score') {
        setSortOrder(prevOrder => prevOrder === 'desc' ? 'asc' : 'desc');
    } else {
        setSortCriterion('score');
        setSortOrder('desc'); 
    }
    setCurrentPage(1);
  }, [sortCriterion]);

  return (
    <div className="p-4">
      {/* Interfaz de ordenamiento */}
        <div className="justify-end mb-4 ml-4 flex space-x-4">
          <button 
            onClick={handleSortByDate}
            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 transform hover:scale-105 shadow-md 
              ${sortCriterion === 'date' 
                ? 'bg-gradient-to-r from-tur2 to-tur1 text-azul border-2 border-tur3 shadow-lg scale-105' 
                : 'bg-white/90 text-oscuro1 border-2 border-tur3/30 hover:border-tur3/60 hover:bg-white cursor-pointer'}`}
          >
            Fecha ({sortCriterion === 'date' ? (sortOrder === 'desc' ? 'Antiguo-Reciente' : 'Antiguo-Reciente'): '⬇'})
          </button>
          <button 
            onClick={handleSortByScore}
            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 transform hover:scale-105 shadow-md 
              ${sortCriterion === 'score' 
                ? 'bg-tur2 text-oscuro3 border-2 border-tur3 shadow-lg scale-105 hover:scale-108 hover:text-oscuro1 hover:bg-tur2/80 cursor-pointer' 
                : 'bg-white/90 text-oscuro1 border-2 border-tur3/30 hover:border-tur3/60 hover:bg-white cursor-pointer'}`}
          >
            Puntuación ({sortCriterion === 'score' ? (sortOrder === 'desc' ? 'Mayor ⬇' : 'Menor ⬆') : '⬇'})
          </button>
        </div>
      {paginationData.paginatedItems.length > 0 ? (
        <div className="p-4 space-y-3">
          {paginationData.paginatedItems.map((review) => (
            <Review key={review.id} {...review} />
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <p className="text-oscuro1 text-lg mb-2 font-bold">
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
