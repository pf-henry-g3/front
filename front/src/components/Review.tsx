import Link from "next/link";

interface ReviewProps {
  id: string,
  userName: string,
  userImage: string,
  reviewDescription: string,
  score: number,
  date: string,
}

export default function Review (
  {
    id, 
    userName, 
    userImage, 
    reviewDescription, 
    score, 
    date
  }: ReviewProps)
  {
  const starsRating = () => {
    if (score === 1) return "★☆☆☆☆";
    if (score === 2) return "★★☆☆☆";
    if (score === 3) return "★★★☆☆";
    if (score === 4) return "★★★★☆";
    if (score === 5) return "★★★★★";
  }
    
  return (
    <div className="border-t-2 flex flex-col border-txt2/40 ">
      <div className="flex flex-row justify-between items-center  py-4 ">
        <div className="flex gap-4 items-center">

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
        <span className="text-sm text-right text-txt1/70">
          {date}
        </span>
      </div>
      <p className="text-txt1/85"> {reviewDescription} </p>
    </div>
  )
}