"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import BandMemberCard from "./BandMemberCard";
import { useParams } from "next/navigation";

interface BandMemberInfo {
  userName: string;
  urlImage: string;
  averageRating: string;
}

export default function BandMembersList() {
  const params = useParams();
  const bandId = params.id as string; 

  const [members, setMembers] = useState<BandMemberInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBandMembers() {
      try {
        const base = (
          process.env.NEXT_PUBLIC_API_URL ??
          process.env.NEXT_PUBLIC_BACKEND_URL ??
          ""
        ).replace(/\/+$/, "");

        const res = await axios.get(`${base}/band/${bandId}`);
        const bandData = res.data.data;

        if (!bandData?.bandMembers) {
          setMembers([]);
          return;
        }

        const mappedMembers: BandMemberInfo[] = bandData.bandMembers.map((member: any) => ({
          userName: member.user.userName,
          urlImage: member.user.urlImage,
          averageRating: member.user.averageRating,
        }));

        setMembers(mappedMembers);
      } catch (err: any) {
        console.error(err);
        setError("Error al cargar los miembros de la banda");
      } finally {
        setLoading(false);
      }
    }

    fetchBandMembers();
  }, [bandId]);

  if (loading) return <p className="text-txt1/80 text-xl font-semibold">Cargando miembros...</p>;
  if (error) return <p className="text-txt1/80 text-xl font-semibold">{error}</p>;
  if(members.length <= 0) return <p className="text-txt1/80 text-xl font-semibold">No se han encontrado los miembros de la banda</p>

  return (
    <div className="flex flex-col">
      {members.map((member) => (
        <BandMemberCard
        key={member.userName}
        userName={member.userName}
        userImage={member.urlImage}
        averageRating={member.averageRating}
      />
    ))}
    </div>
  );
}
