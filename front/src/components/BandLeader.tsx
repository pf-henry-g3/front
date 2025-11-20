"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";

// Interfaz para la info del líder
interface BandLeaderInfo {
  id: string;
  userName: string;
  urlImage: string;
  averageRating: string;
}

export default function BandLeader() {
  const params = useParams();
  const bandId = params.id as string;

  const [leader, setLeader] = useState<BandLeaderInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bandId) return;

    async function fetchLeader() {
      try {
        const base = (
          process.env.NEXT_PUBLIC_API_URL ??
          process.env.NEXT_PUBLIC_BACKEND_URL ??
          ""
        ).replace(/\/+$/, "");

        const res = await axios.get(`${base}/band/${bandId}`);
        const bandData = res.data.data;

        if (!bandData?.leader) {
          setLeader(null);
          return;
        }

        const leaderData: BandLeaderInfo = {
          id: bandData.leader.id,
          userName: bandData.leader.userName,
          urlImage: bandData.leader.urlImage,
          averageRating: bandData.leader.averageRating,
        };

        setLeader(leaderData);
      } catch (err: any) {
        console.error(err);
        setError("Error al cargar el líder de la banda");
      } finally {
        setLoading(false);
      }
    }

    fetchLeader();
  }, [bandId]);

  if (loading) return <p>Cargando líder...</p>;
  if (error) return <p>{error}</p>;
  if (!leader) return <p>No se encontró líder</p>;

  return (
    <div className="p-4 bg-white/90 rounded-3xl shadow-sm border-tur3 border-2 w-48  mx-auto text-center">
      <img
        src={leader.urlImage}
        alt={leader.userName}
        className="w-32 h-32 rounded-full border-tur3 border-3 shadow-4xs mx-auto mb-2"
      />
      <p className="text-center text-oscuro1 font-bold">{leader.userName}</p>
      <p className="text-center text-oscuro3 text-sm">{leader.averageRating}</p>
    </div>
  );
}
