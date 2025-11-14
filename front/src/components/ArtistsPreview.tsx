"use client";

import { useEffect, useState } from "react";
import ArtistsPreviewCard from "./artistsPreviewCard";
import HorizontalScroller from "./HorizontalScroller";
import Link from "next/link";
import axios from "axios";

export default function ArtistsPreview() {
  const [artists, setArtists] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const base = (process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || '').replace(/\/+$/, '');
        if (!base) {
          setArtists([]);
          setLoading(false);
          return;
        }
        const res = await axios.get(`${base}/user`);
        const raw = res.data?.data ?? res.data ?? [];

        if (Array.isArray(raw) && raw.length > 0) {
          const users = raw.map((u: any) => ({
            id: String(u.id ?? u._id ?? `user-${Math.random()}`),
            userName: u.userName ?? u.name ?? "Usuario",
            profilePicture: u.urlImage ?? u.profilePicture ?? "/default-user.jpg",
            country: u.country ?? "",
            averageRating: Number(u.averageRating ?? u.avgRating ?? 0),
          }));
          setArtists(users);
        } else {
          setArtists([]);
        }
      } catch (err) {
        setArtists([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="mt-16">
      <h1 className="text-txt1 font-bold text-center text-3xl text-shadow-md mb-4">Nuestros preciados artistas</h1>

      <div className="mx-auto max-w-[83%] rounded-4xl py-1.5 px-2">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-tur1" />
          </div>
        ) : artists.length === 0 ? (
          <div className="text-center py-8 text-md text-txt2">No se encontraron artistas.</div>
        ) :(
          <HorizontalScroller>
            {artists.map((artist) => (
              <Link
                href={`/user/${artist.id}`}
                key={artist.id}
                className="shrink-0 w-64 flex justify-center snap-start"
              >
                <ArtistsPreviewCard
                  userName={artist.userName}
                  profilePicture={artist.profilePicture}
                  country={artist.country}
                  averageRating={artist.averageRating ?? 0}
                />
              </Link>
            ))}
          </HorizontalScroller>
        )}
      </div>
    </div>
  );
}