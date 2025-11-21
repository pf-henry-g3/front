"use client"

import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useMemo } from "react";
import Pagination from "@/src/components/Pagination";
import Swal from "sweetalert2";
import IVacancy from "@/src/interfaces/IVacancy";

interface ApplicationsProps {
    refreshTrigger?: number;
}

interface IApplication {
  applicantId: ApplicationId,
  applicationDate: string,
  applicationDescription: string,
}

interface ApplicationId {
  name: string,
  userName: string,
  urlImage: string,
  averageRating: string,
}

export default function Applications( {refreshTrigger = 0}: ApplicationsProps) {
  const router = useRouter();
  const params = useParams();
  const vacancyId = params.id as string

  const [applications, setApplications] = useState<IApplication[]>([]);
  const [vacancy, setVacancy] = useState<IVacancy>();

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  useEffect(() => {
    async function fetchVacancy() {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
            await Swal.fire({
                icon: "warning",
                title: "Sesión requerida",
                text: "Debes iniciar sesión para crear bandas",
                confirmButtonColor: "#F59E0B"
            });
            router.push('/login');
            return;
        }
        if (!vacancyId) {
            console.log("no se ha encontrado el id de la vacante");
            return;
        }
        console.log("id de la vacante", vacancyId);
        const base = (process.env.NEXT_PUBLIC_BACKEND_URL ?? process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/+$/, '');
        const vacRes = await axios.get(
          `${base}/vacancy/${vacancyId}`,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );
          console.log("vacancy del usuario traidas con exito");
          console.log("Respuesta del backend:", vacRes.data);
          setVacancy(vacRes.data?.data ? vacRes.data.data : "");
        } catch (err) {
          console.log(err);
        }
    }
    async function fetchApplications() {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
            await Swal.fire({
                icon: "warning",
                title: "Sesión requerida",
                text: "Debes iniciar sesión para crear bandas",
                confirmButtonColor: "#F59E0B"
            });
            router.push('/login');
            return;
        }
        if (!vacancyId) {
            console.log("no se ha encontrado el id de la vacante");
            return;
        }
        console.log("id de la vacante", vacancyId);
        const base = (process.env.NEXT_PUBLIC_BACKEND_URL ?? process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/+$/, '');
        const appliRes = await axios.get(
          `${base}/vacancy/getAllApplications/${vacancyId}`,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );
          console.log("vacancy del usuario traidas con exito");
          console.log("Respuesta del backend:", appliRes.data);
          const appliArray = Array.isArray(appliRes.data?.data) ? appliRes.data.data : [];
          setApplications(appliArray);
        } catch (err) {
          console.log(err);
        }
      }
      fetchVacancy();
      fetchApplications();
    }, [refreshTrigger]);

  const paginationData = useMemo(() => {
    const totalPages = Math.ceil(applications.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedItems = applications.slice(startIndex, endIndex);
  
    return {
      totalPages,
      paginatedItems,
      totalItems: applications.length
    };
  }, [applications, currentPage, itemsPerPage]);
  
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);
  
  const handleItemsPerPageChange = useCallback((newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  }, []);
  
  if (!vacancy) return <div className="mt-24 text-center text-xl text-txt1"> La vacante seleccionada no se ha encontrado o es inexistente</div>
  return (
    <div className="mt-30 flex flex-col max-w-[60%] mx-auto bg-azul pt-8  rounded-4xl shadow-sm">

      <div className=" mx-auto">
        <span className="flex flex-row items-center justify-center gap-6">
          <img
            src={vacancy.vacancyImage}
            alt={vacancy.name || '/default-image.jpg'}
            className="w-24 h-24 border-tur1 border rounded-full hover:border-2 hover:border-tur2 transition"
          />
          <h1 className="text-3xl text-oscuro1 font-bold">{vacancy.name}</h1>
        </span>
        <p className="mt-8 text-lg text-oscuro2 border-2 border-txt2 bg-txt1/90 p-2 rounded-2xl min-h-48 min-w-lg">{vacancy.vacancyDescription}</p>
      </div>
      { applications.length > 0 ? (
      <div className="flex flex-col my-12 gap-8">
        {paginationData.paginatedItems.map((application) => (
        <div className="w-[75%] mx-auto bg-tur2/20 p-2 rounded-4xl shadow-md">
          <div className="flex flex-row bg-tur2/40 items-center shadow-md justify-between rounded-full px-1.5">
            <div className="flex flex-row items-center gap-3">
              <img 
                src={application.applicantId.urlImage}
                alt={application.applicantId.userName}
                className="w-16 h-16 rounded-full  my-1.5 object-cover shrink-0 border-2 border-tur3/30 shadow-md"
              />
              <div>
                <h1 className="text-oscuro3 font-semibold text-2xl text-shadow-md">{application.applicantId.userName}</h1>
              </div>
            </div>
            <div>
              <h1 className="font-bold text-txt1 text-3xl text-end mr-5 text-shadow-md">{application.applicantId.averageRating}</h1>
              <h1 className="font-bold text-txt2 text-sm mr-5 text-shadow-md">{application.applicationDate.split("T")[0]}</h1>
            </div>
          </div>
          <h1 className="text-txt1/85 text-md text-center mt-1.5">{application.applicationDescription}</h1>
        </div>
      ))}
      </div>
      ) : (
        <div className="my-12 text-txt1/85 text-xl font-semibold text-center">
          Aún no hay postulantes para esta vacante
        </div>
      )
      }
      <div>
        {applications.length > 0 && (
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