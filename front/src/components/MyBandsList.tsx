"use client"
import { useEffect, useState, useCallback, useMemo } from "react";
import Pagination from "./Pagination";
import axios from "axios";
import MyBandPreview from "./MyBandPreview";

export default function MyBandsList() {

  const [bands, setBands] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(3);

  useEffect(() => {
    const fetchBands = async () => {
      setLoading(true);
      try {
        const base = (process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || '').replace(/\/+$/, '');
        if (!base) {
          setBands([]);
          setLoading(false);
          return;
        }
        const res = await axios.get(`${base}/band`);
        const raw = res.data?.data ?? res.data ?? [];

        if (Array.isArray(raw) && raw.length > 0) {
          const mapped = raw.map((b: any) => ({
            id: String(b.id ?? b._id ?? `band-${Math.random()}`),
            name: b.name ?? b.bandName ?? "Banda",
            bandImage: b.bandImage ?? b.image ?? b.urlImage ?? "/default-band.jpg",
          }));
          setBands(mapped);
        } else {
          setBands([]); 
        }
      } catch (err) {
        console.log(err)
        setBands([]); 
      } finally {
        setLoading(false);
      }
    };

    fetchBands();
  }, []);

  const paginationData = useMemo(() => {
    const totalPages = Math.ceil(bands.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedItems = bands.slice(startIndex, endIndex);
  
  return {
    totalPages,
    paginatedItems,
    totalItems: bands.length
  };
  }, [bands, currentPage, itemsPerPage]);

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
                        name={band.name}
                        formationYear={band.formationYear}
                        description={band.description}
                        bandImage={band.bandImage}
                        />
                      ))}
            </div>
          ) : bands.length === 0 ? (
            <div className="flex items-center justify-center py-20">
                <div className="text-center">
                    <p className="text-txt1 text-lg mb-2 font-bold">
                        No se encontraron resultados
                    </p>
                    <p className="text-txt2 text-sm font-medium">
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
          {bands.length > 0 && (
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
                  )
                }
        </div>
      </div>
    </div>
  )
}