"use client"

import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useMemo } from "react";
import Pagination from "@/src/components/Pagination";
import Swal from "sweetalert2";
import { IBand } from "@/src/interfaces/IBand";
import BandMemberCard from "@/src/components/BandMemberCard";

interface BandsProps {
    refreshTrigger?: number;
}

interface BandMemberProps {
  userName: string,
  urlImage: string,
  averageRating: string,
}

export default function Band( {refreshTrigger = 0}: BandsProps) {
  const router = useRouter();
  const params = useParams();
  const bandId = params.id as string

  const [band, setBand] = useState<IBand>();
  const [members, setMembers] = useState<BandMemberProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  useEffect(() => {
    async function fetchBand() {
      try {
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

        if (!bandId) {
          console.log("no se ha encontrado el id de la banda");
          return;
        }

        console.log("id de la vacante", bandId);

        const base = (
          process.env.NEXT_PUBLIC_BACKEND_URL ??
          process.env.NEXT_PUBLIC_API_URL ??
          ""
        ).replace(/\/+$/, "");

        const bandRes = await axios.get(`${base}/band/${bandId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        console.log("vacancy del usuario traidas con exito");
        console.log("Respuesta del backend:", bandRes.data);

        setBand(bandRes.data?.data ? bandRes.data.data : "");
      } catch (err) {
        console.log(err);
      }
    }

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

        const mappedMembers: BandMemberProps[] = bandData.bandMembers.map(
          (member: any) => ({
            userName: member.user.userName,
            urlImage: member.user.urlImage,
            averageRating: member.user.averageRating,
          })
        );

        setMembers(mappedMembers);
      } catch (err: any) {
        console.error(err);
        setError("Error al cargar los miembros de la banda");
      } finally {
        setLoading(false);
      }
    }

    fetchBand();
    fetchBandMembers();
  }, [refreshTrigger]);


  const paginationData = useMemo(() => {
    const totalPages = Math.ceil(members.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedItems = members.slice(startIndex, endIndex);
  
    return {
      totalPages,
      paginatedItems,
      totalItems: members.length
    };
  }, [members, currentPage, itemsPerPage]);
  
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);
  
  const handleItemsPerPageChange = useCallback((newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  }, []);
  
  if (!band) return <div className="mt-24 text-center text-xl text-txt1"> La vacante seleccionada no se ha encontrado o es inexistente</div>
  return (
    <div className="mt-30 flex flex-col max-w-[60%] mx-auto bg-azul pt-8  rounded-4xl shadow-sm">

      <div className=" mx-auto">
        <span className="flex flex-row items-center justify-center gap-6">
          <img
            src={band.urlImage}
            alt={band.bandName || '/default-image.jpg'}
            className="w-24 h-24 border-tur1 border rounded-full hover:border-2 hover:border-tur2 transition"
          />
          <h1 className="text-3xl text-oscuro1 font-bold">{band.bandName}</h1>
        </span>
        <p className="mt-8 text-lg text-oscuro2 border-2 border-txt2 bg-txt1/90 p-2 rounded-2xl min-h-48 min-w-lg">{band.bandDescription}</p>
      </div>
      { members.length > 0 ? (
      <div className="flex flex-col my-12 gap-8">
        {paginationData.paginatedItems.map((member) => (
                <BandMemberCard
                key={member.userName}
                userName={member.userName}
                userImage={member.urlImage}
                averageRating={member.averageRating}
              />
            ))}
      </div>
      ) : (
        <div className="my-12 text-txt1/85 text-xl font-semibold text-center">
          Aún no hay postulantes para esta vacante
        </div>
      )
      }
      <div>
        {members.length > 0 && (
          <div className="pb-4 mx-auto w-[76%]">
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