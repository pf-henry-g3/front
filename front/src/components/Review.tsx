import Link from "next/link";

interface ReviewProps {
  id: string,
  userName: string,
  userImage: string,
  reviewDescription: string,
  rating: number,
}

export default function Review ({id, userName, userImage, reviewDescription, rating}: ReviewProps) {
  const starsRating = () => {
    if (rating === 1) return "★☆☆☆☆";
    if (rating === 2) return "★★☆☆☆";
    if (rating === 3) return "★★★☆☆";
    if (rating === 4) return "★★★★☆";
    if (rating === 5) return "★★★★★";
  }
    
  return (
    <div className="border-t-2 flex flex-col border-txt2/40 ">
      <div className="flex flex-row items-center gap-4 py-4 ">
        <img 
            src={userImage || '/default-image.jpg'} 
            alt={userName}
            className="w-14 h-14 rounded-full object-cover shrink-0 border-2 border-tur3/30 shadow-md"
            />
        <Link 
        className="font-bold text-lg  text-oscuro1 truncate drop-shadow-sm"
        href={`/detail/${id}`} 
        >
            {userName}
        </Link>
        <p className="text-text2  text-end text-shadow-md text-2xl max-w-16 ">
          {starsRating()}
        </p>
      </div>
      <p className="text-txt1/85"> {reviewDescription} </p>
    </div>
  )
}