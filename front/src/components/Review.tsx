import Link from "next/link";

interface ReviewProps {
  id: string,
  userName: string,
  userImage: string,
  reviewDescription: string,
  rating: number,
}

export default function Review ({id, userName, userImage, reviewDescription, rating}: ReviewProps) {
  return (
    <div className="border-t-2 flex flex-col border-txt2/40 ">
      <div className="flex flex-row items-center gap-4 py-4 ">
        <img 
            src={userImage || '/default-image.jpg'} 
            alt={userName}
            className="w-14 h-14 rounded-full object-cover shrink-0 border-2 border-tur3/30 shadow-md"
            />
        <Link 
        className="flex-1 min-w-0"
        href={`/detail/${id}`} 
        >
            <h3 className="font-bold text-lg text-oscuro1 truncate drop-shadow-sm">{userName}</h3>
        </Link>
        <span className="text-verde/40 text-shadow-sm text-3xl max-w-16 font-semibold hover:text-shadow-lg">
          {rating}/5
        </span>
      </div>
      <p className="text-oscuro3"> {reviewDescription} </p>
    </div>
  )
}