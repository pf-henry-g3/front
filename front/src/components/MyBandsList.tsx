"use client"
import { useEffect, useState, useCallback, useMemo } from "react";
import Pagination from "./Pagination";
import axios from "axios";
import MyBandPreview from "./MyBandPreview";

interface LeaderOfBand {
  id: string;
  bandName: string;
  urlImage: string;
  averageRating: string;
}

export default function MyBandsList() {

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(3);

  const [leaderOf, setLeaderOf] = useState<LeaderOfBand[]>([]);

  useEffect(() => {
    async function fetchLeaderOf() {
      const base = (process.env.NEXT_PUBLIC_API_URL ?? process.env.NEXT_PUBLIC_BACKEND_URL ?? '').replace(/\/+$/, '');
      const res = await axios.get(`${base}/user`); 
      setLeaderOf(res.data.data.leaderOf || []);
    }

    fetchLeaderOf();
  }, []);

  const paginationData = useMemo(() => {
    const totalPages = Math.ceil(leaderOf.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedItems = leaderOf.slice(startIndex, endIndex);

    return {
      totalPages,
      paginatedItems,
      totalItems: leaderOf.length
    };
  }, [leaderOf, currentPage, itemsPerPage]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleItemsPerPageChange = useCallback((newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  }, []);

  return (
    <div className="max-w-[60%] mx-auto px-8">
      <h1 className="text-txt1 font-bold text-center text-3xl text-shadow-md mb-4">
        Tus Bandas
      </h1>

      <div className="bg-linear-to-br from-white/80 to-white/90 rounded-2xl">
        <div className="py-1.5 ">
          
          {paginationData.paginatedItems.length > 0 ? (
            <div className="p-4 space-y-3">
              {paginationData.paginatedItems.map((band) => (
                <MyBandPreview
                  key={band.id}
                  {...band}
                />
              ))}
            </div>

          ) : leaderOf.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <p className="text-verde text-lg mb-2 font-bold">
                  No se encontraron resultados
                </p>
                <p className="text-tur2 text-sm font-medium">
                  Intenta crear o unirte a una banda
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

        </div>

        <div>
          {leaderOf.length > 0 && (
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
    </div>
  )
}