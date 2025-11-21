"use client"
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import ReviewsView from "./ReviewsView";
import ReviewForm from "./ReviewForm";
import ReviewsList from "./ReviewsList";
import Swal from "sweetalert2";
import BandMember from "./BandMember";
import LeaderBand from "./BandLeader";
import BandLeader from "./BandLeader";
import BandGenres from "./BandGenres";
import VacancyGenres from "./VacancyGenres";

interface ProductCardProps {
  id: string;
  name: string;
  type: "band" | "user" | "vacancy";
  description?: string;
  imageUrl?: string;
  formationYear?: number;
  city?: string;
  country?: string;
  isOpen?: boolean;
  averageRating?: number;
}

interface DetailViewProps {
  selectedItem: ProductCardProps | null;
}

export default function DetailView({ selectedItem }: DetailViewProps) {
  const router = useRouter();

  const handleApply = () => {
    if (selectedItem?.id) {
      router.push(`/application/${selectedItem.id}`);
    }
  };

  if (!selectedItem) {
    return (
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-tur3/30 p-8 max-w-2xl mx-auto">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-oscuro1 mb-4 drop-shadow-md">
            📊 Directorio Universal
          </h2>
          <p className="text-oscuro2 mb-8 text-lg font-medium">
            Explora bandas, usuarios y vacantes disponibles en nuestra plataforma musical.
          </p>

          <div className="py-16">
            <div className="text-8xl mb-6 animate-pulse">👈</div>
            <div className="bg-tur1/20 rounded-xl p-6 border border-tur3/20">
              <p className="text-oscuro1 text-xl mb-3 font-semibold">
                Selecciona un elemento
              </p>
              <p className="text-oscuro2 text-base">
                Haz click en cualquier ProductCard para ver información detallada
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getTypeIcon = () => {
    switch (selectedItem.type) {
      case 'band': return '🎵';
      case 'user': return '👤';
      case 'vacancy': return '💼';
      default: return '📋';
    }
  };

  const getTypeTitle = () => {
    switch (selectedItem.type) {
      case 'band': return 'Banda';
      case 'user': return 'Músico';
      case 'vacancy': return 'Vacante';
      default: return 'Elemento';
    }
  };

  const getTypeSpecificInfo = () => {
    if (selectedItem.type === 'band' && selectedItem.formationYear) {
      return `Año de formación: ${selectedItem.formationYear}`;
    }
    if ((selectedItem.type === 'user' || selectedItem.type === 'vacancy') && selectedItem.city) {
      return `Ubicación: ${selectedItem.city}${selectedItem.country ? `, ${selectedItem.country}` : ''}`;
    }
    if (selectedItem.type === 'vacancy' && selectedItem.isOpen !== undefined) {
      return `Estado: ${selectedItem.isOpen ? '✅ Abierta' : '❌ Cerrada'}`;
    }
    return null;
  };

  const getTypeRating = () => {
    if (selectedItem.type === 'user' && selectedItem.averageRating) {
      return `${selectedItem.averageRating}`;
    }
    return null;
  };

  const [isReviewsOpen, setIsReviewsOpen] = useState(false);
  const ReviewsButtonHandler = () => {
    if (isReviewsOpen === false) setIsReviewsOpen(true);
    else setIsReviewsOpen(false)
  }

  const IsLoggedHandler = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        console.warn('⚠️ No hay token disponible');
        await Swal.fire({
          icon: "warning",
          title: "Sesión requerida",
          text: "Debes iniciar sesión para ver las reseñas",
          confirmButtonColor: "#F59E0B"
        });
        router.push('/login');
        return;
      } return;
    }
      
  return (
    <div className="flex flex-col w-full max-w-2xl p-6 shadow-xl backdrop-blur-sm rounded-2xl border mx-auto bg-white/10 border-white/20">
      {/* ✅ Imagen más grande */}
      <div className="flex justify-center mb-4">
        <img
          className="w-full h-72 rounded-xl border-4 border-tur3/40 object-cover shadow-2xl"
          src={selectedItem.imageUrl || "/default-image.jpg"}
          alt={selectedItem.name}
        />
      </div>

      {/* Información del elemento */}
      <div className="flex-1">
        <div className="bg-tur1/20 rounded-xl shadow-lg pt-5 px-5 border border-tur3/30">
          {/* Encabezado con tipo e icono */}
          <div className="text-center mb-4">
            <div className="text-5xl mb-3">{getTypeIcon()}</div>
            <span className="inline-block bg-tur1 text-azul text-sm font-semibold px-5 py-2 rounded-full mb-3 shadow-md">
              {getTypeTitle()}
            </span>
            <h1 className="text-oscuro1 font-bold text-3xl drop-shadow-md">
              {selectedItem.name}
            </h1>
          </div>

          <div className="space-y-4">
            {/* Información específica del tipo */}
            {getTypeSpecificInfo() && (
              <div className="text-center p-3 bg-tur2/30 rounded-xl border border-tur3/20">
                <p className="text-oscuro1 text-base font-semibold">
                  {getTypeSpecificInfo()}
                </p>
              </div>
            )}

            {/* Descripción */}
            <div className="pt-3 pb-2.5">
              <h3 className="font-bold text-oscuro1 mb-3 text-center text-lg">
                {selectedItem.type === 'band' ? 'Descripción de la banda:' :
                  selectedItem.type === 'user' ? 'Sobre este músico:' :
                    selectedItem.type === 'vacancy' ? 'Descripción de la vacante:' :
                      'Descripción:'}
              </h3>
              <div className="bg-white/85 backdrop-blur-sm p-5 rounded-xl max-h-48 overflow-y-auto border-2 border-tur3/30 shadow-sm">
                <p className="text-oscuro1 text-base leading-relaxed text-justify font-medium">
                  {selectedItem.description || "No hay descripción disponible"}
                </p>
              </div>

              {/* 4. Integración: Botón Postular (Solo para vacantes) */}
              {selectedItem.type === 'vacancy' ? (
                
                <div className="pt-6 pb-2">
                  <VacancyGenres/>
                  <button
                    onClick={handleApply}
                    className="w-full py-3 px-6 bg-gradient-to-r from-tur1 to-tur2 hover:from-tur2 hover:to-tur3 text-azul rounded-xl text-lg font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                  >
                    Postular a Vacante
                  </button>
                </div>
              ) : selectedItem.type === 'band' ? (
                <div className="flex flex-col gap-4 mt-8 mb-4">
                  <BandGenres/>
                  <h2 className="text-center text-3xl text-oscuro2 font-bold mt-2 mb-1">Lider de la banda</h2>
                  <BandLeader/>
                  <h2 className="text-center text-3xl text-oscuro2 font-bold mt-5 mb-1">Lista de miembros</h2>
                  <BandMember/>
                </div>
              ) : (selectedItem.type === 'user' && getTypeRating() && (
                <div>
                  <div className="pt-3 flex flex-row justify-between gap-8">
                    <p className=" text-text2 text-shadow-sm text-3xl max-w-16 font-semibold hover:text-shadow-lg">
                      {getTypeRating()}
                    </p>
                    {isReviewsOpen === false ? (
                      <button
                        className="text-oscuro3 py-1.5 px-2.5 font-semibold rounded-lg max-w-32 shadow-xs cursor-pointer bg-tur1/70 hover:bg-tur1 transition"
                        onClick={async () => {
                          await IsLoggedHandler();
                          ReviewsButtonHandler();
                        }}
                      >
                        Ver reseñas
                      </button>
                    ) : (
                      <button
                        className="text-oscuro3 py-1.5 px-2.5 font-semibold rounded-lg max-w-36 shadow-xs cursor-pointer bg-tur1/70 hover:bg-tur1 transition"
                        onClick={ReviewsButtonHandler}
                      >
                        Cerrar reseñas
                      </button>
                    )
                    }
                  </div>
                  <ReviewsView isOpen={isReviewsOpen}>
                    <ReviewForm receptorUserName={selectedItem.name} />
                    <ReviewsList />
                  </ReviewsView>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}