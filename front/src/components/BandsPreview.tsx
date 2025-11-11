"use client";

import { useEffect, useState } from "react";
import BandsPreviewCard from "./BandsPreviewCard";
import HorizontalScroller from "./HorizontalScroller";
import Link from "next/link";
import axios from "axios";

export default function BandsPreview() {
  const [bands, setBands] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBands = async () => {
      setLoading(true);
      try {
        const base = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");
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
        console.error("Error fetching bands:", err);
        setBands([]); 
      } finally {
        setLoading(false);
      }
    };

    fetchBands();
  }, []);

  return (
    <div>
      <h1 className="text-txt1 mt-16 font-bold text-center text-3xl text-shadow-md mb-4">
        Algunas de nuestras bandas registradas...
      </h1>

      <div className="mx-auto max-w-[83%] rounded-4xl py-1.5 px-2">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-tur1" />
          </div>
        ) : bands.length === 0 ? (
          <div className="text-center py-8 text-md text-txt2">No se encontraron bandas.</div>
        ) : (
          <HorizontalScroller>
            {bands.map((band) => (
              <Link
                href={`/band/${band.id}`}
                key={band.id}
                className="shrink-0 w-64 flex justify-center snap-start"
              >
                <BandsPreviewCard name={band.name} image={band.bandImage} />
              </Link>
            ))}
          </HorizontalScroller>
        )}
      </div>
    </div>
  );
}