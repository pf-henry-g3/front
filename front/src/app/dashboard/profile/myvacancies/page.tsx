"use client"
import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Pagination from "@/src/components/Pagination";
import axios from "axios";
import Swal from "sweetalert2";
import IVacancy from "@/src/interfaces/IVacancy";
import MyBandPreview from "@/src/components/MyBandPreview";
import Link from "next/link";

interface MyVacancyListProps {
    refreshTrigger?: number;
}

export default function MyVacantList({ refreshTrigger = 0 }: MyVacancyListProps) {
    const router = useRouter();

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(3);

    const [vacancy, setVacancy] = useState<IVacancy[]>([]);

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

                const storedUser = localStorage.getItem("user");
                if (!storedUser) return;

                const parsedUser = JSON.parse(storedUser);
                const id = parsedUser.id;

                if (!id) {
                    console.log("no se ha encontrado el id de usuario");
                    return;
                }

                console.log("id del usuario", id);

                const base = (process.env.NEXT_PUBLIC_BACKEND_URL ?? process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/+$/, '');

                const res = await axios.get(
                    `${base}/user/getAllVacancies`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }

                );

                console.log("vacancy del usuario traidas con exito");
                console.log("Respuesta del backend:", res.data);

                const vacArray = Array.isArray(res.data?.data) ? res.data.data : [];
                setVacancy(vacArray);

            } catch (err) {
                console.log(err);
            }
        }

        fetchVacancy();
    }, [refreshTrigger]);



    const paginationData = useMemo(() => {
        const totalPages = Math.ceil(vacancy.length / itemsPerPage);
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedItems = vacancy.slice(startIndex, endIndex);

        return {
            totalPages,
            paginatedItems,
            totalItems: vacancy.length
        };
    }, [vacancy, currentPage, itemsPerPage]);

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const handleItemsPerPageChange = useCallback((newItemsPerPage: number) => {
        setItemsPerPage(newItemsPerPage);
        setCurrentPage(1);
    }, []);

    return (
        <div className="max-w-[60%] mx-auto px-8 mt-28">
            <h1 className="text-txt1 font-bold text-center text-3xl text-shadow-md mb-4">
                Tus Vacantes
            </h1>

            <div className="bg-linear-to-br from-white/80 to-white/90 rounded-2xl">
                <div className="py-1.5 ">

                    {paginationData.paginatedItems.length > 0 ? (
                        <div className="p-4 space-y-3">
                            {paginationData.paginatedItems.map((vacancies) => (
                                <Link
                                    className="flex items-center bg-white/95 hover:bg-white/55 transition gap-4 rounded-xl shadow-xl"
                                    href={`/dashboard/profile/myvacancies/list/${vacancies.id}`}
                                >
                                    <img
                                        src={vacancies.vacancyImage || '/default-image.jpg'}
                                        alt={vacancies.vacancyImage}
                                        className="w-14 h-14 rounded-full object-cover shrink-0 border-2 m-4 border-tur3/30 shadow-md"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-lg text-oscuro1 drop-shadow-sm">{vacancies.name}</h3>
                                        <h3 className="font-normal text-md text-txt2 line-clamp-1">{vacancies.vacancyDescription}</h3>
                                    </div>
                                    <div>Buscar la manera de avisar si hay postulantes</div>
                                </Link>
                            ))}
                        </div>

                    ) : vacancy.length === 0 ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="text-center">
                                <p className="text-verde text-lg mb-2 font-bold">
                                    No se encontraron resultados
                                </p>
                                <p className="text-tur2 text-sm font-medium">
                                    No tienes vacantes
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
                    {vacancy.length > 0 && (
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