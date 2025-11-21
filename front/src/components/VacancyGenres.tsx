"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";

interface VacancyGenre {
  id: string;
  name: string;
}

export default function VacancyGenres() {
  const params = useParams();
  const vacancyId = params.id as string; 

  const [genres, setGenres] = useState<VacancyGenre[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!vacancyId) return;

    async function fetchGenres() {
      try {
        const base = (
          process.env.NEXT_PUBLIC_API_URL ??
          process.env.NEXT_PUBLIC_BACKEND_URL ??
          ""
        ).replace(/\/+$/, "");

        const res = await axios.get(`${base}/vacancy/${vacancyId}`);
        const vacantData = res.data.data;

        if (!vacantData?.genres) {
          setGenres([]);
          return;
        }

        const mappedGenres: VacancyGenre[] = vacantData.genres.map((genre: any) => ({
          id: genre.id,
          name: genre.name,
        }));

        setGenres(mappedGenres);
      } catch (err: any) {
        console.error(err);
        setError("Error al cargar los géneros de la vacante");
      } finally {
        setLoading(false);
      }
    }

    fetchGenres();
  }, [vacancyId]);

  if (loading) return <p>Cargando géneros...</p>;
  if (error) return <p>{error}</p>;
  if (genres.length === 0) return <p>No se encontraron géneros</p>;

  return (
    <div className="flex flex-wrap pb-6 justify-center gap-4">
      {genres.map((genre) => (
        <span
          key={genre.id}
          className="px-3 py-1 bg-txt1 text-azul rounded-full text-lg font-medium shadow-sm" 
        >
          {genre.name}
        </span>
      ))}
    </div>
  );
}
