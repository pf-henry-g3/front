"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { apiClient } from "@/src/lib/api-client";
import ApplicationForm from "@/src/components/Applicationform";

interface VacancyInfo {
    id: string;
    name: string;
    vacancyType: string;
}

export default function ApplicationPage() {
    const params = useParams();
    const router = useRouter();
    const vacancyId = params.id as string;
    const [vacancy, setVacancy] = useState<VacancyInfo | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchVacancyInfo = async () => {
            try {
                const response = await apiClient.get(`/vacancy/${vacancyId}`);
                setVacancy(response.data);
            } catch (error) {
                console.error('Error cargando vacante:', error);
                router.push('/vacancies');
            } finally {
                setLoading(false);
            }
        };

        fetchVacancyInfo();
    }, [vacancyId, router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-fondo1 via-fondo2 to-fondo3 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-tur1 mx-auto mb-4"></div>
                    <p className="text-txt1">Cargando...</p>
                </div>
            </div>
        );
    }

    if (!vacancy) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-fondo1 via-fondo2 to-fondo3 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-txt1 text-xl mb-4">Vacante no encontrada</h2>
                    <button
                        onClick={() => router.push('/vacancies')}
                        className="px-6 py-3 bg-tur1 text-azul rounded-lg hover:bg-tur2 transition-colors"
                    >
                        Volver a vacantes
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-fondo1 via-fondo2 to-fondo3 py-12 px-4 sm:px-6 lg:px-8">
            <div className="container mx-auto max-w-2xl">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-txt1 mb-2">
                        Postular a Vacante
                    </h1>
                    <p className="text-txt2 text-lg">
                        {vacancy.vacancyType}: {vacancy.name}
                    </p>
                </div>

                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl p-6 md:p-8">
                    <ApplicationForm vacancyId={vacancyId} />
                </div>
            </div>
        </div>
    );
}