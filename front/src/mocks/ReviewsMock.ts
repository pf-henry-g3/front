interface ReviewProps {
  id: string,
  userName: string,
  userImage: string,
  reviewDescription: string,
  rating: number,
}

export const reviewsMock: ReviewProps[] = [
  {
    id: "1",
    userName: "Juan Pérez",
    userImage: "https://i.pravatar.cc/150?img=1",
    reviewDescription: "Excelente experiencia, súper recomendado.",
    rating: 5,
  },
  {
    id: "2",
    userName: "María López",
    userImage: "https://i.pravatar.cc/150?img=2",
    reviewDescription: "Todo muy bien, pero podría mejorar el tiempo de respuesta.",
    rating: 4,
  },
  {
    id: "3",
    userName: "Carlos Gómez",
    userImage: "https://i.pravatar.cc/150?img=3",
    reviewDescription: "Normal, nada fuera de lo común.",
    rating: 3,
  },
  {
    id: "4",
    userName: "Ana Martínez",
    userImage: "https://i.pravatar.cc/150?img=4",
    reviewDescription: "No tuve una buena experiencia, esperaba más.",
    rating: 2,
  },
  {
    id: "5",
    userName: "Lucía Fernández",
    userImage: "https://i.pravatar.cc/150?img=5",
    reviewDescription: "Muy mala atención, no lo recomiendo.",
    rating: 1,
  },
];