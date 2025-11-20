"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";

interface BandGenre {
  id: string;
  name: string;
}

export default function BandGenres() {
  const params = useParams();
  const bandId = params.id as string; 

  const [genres, setGenres] = useState<BandGenre[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bandId) return;

    async function fetchGenres() {
      try {
        const base = (
          process.env.NEXT_PUBLIC_API_URL ??
          process.env.NEXT_PUBLIC_BACKEND_URL ??
          ""
        ).replace(/\/+$/, "");

        const res = await axios.get(`${base}/band/${bandId}`);
        const bandData = res.data.data;

        if (!bandData?.genres) {
          setGenres([]);
          return;
        }

        const mappedGenres: BandGenre[] = bandData.genres.map((genre: any) => ({
          id: genre.id,
          name: genre.name,
        }));

        setGenres(mappedGenres);
      } catch (err: any) {
        console.error(err);
        setError("Error al cargar los géneros de la banda");
      } finally {
        setLoading(false);
      }
    }

    fetchGenres();
  }, [bandId]);

  if (loading) return <p>Cargando géneros...</p>;
  if (error) return <p>{error}</p>;
  if (genres.length === 0) return <p>No se encontraron géneros</p>;

  return (
    <div className="flex flex-wrap justify-center gap-4">
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
