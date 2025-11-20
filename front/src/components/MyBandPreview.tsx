import Link from "next/link";
import IMyBandPreviewDetailProps from "../interfaces/IMyBandPreviewDetailProps";

export default function MyBandPreview ({id, bandName, averageRating, urlImage, bandDescription, city, country}: IMyBandPreviewDetailProps) {
  return (
    <Link 
      className="flex items-center bg-white/95 hover:bg-white/55 transition gap-4 rounded-xl shadow-xl"
      href={`/detail/${id}?type=band`}
    >
      <img 
          src={urlImage || '/default-image.jpg'} 
          alt={bandName}
          className="w-14 h-14 rounded-full object-cover shrink-0 border-2 m-4 border-tur3/30 shadow-md"
          />
      <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg text-oscuro1 drop-shadow-sm">{bandName}</h3>
          <h3 className="font-normal text-md text-txt2 line-clamp-1">{bandDescription}</h3>
      </div>
      {/*<div className="text-right pr-4">
          <span className="text-xs text-oscuro2 font-medium bg-tur2/20 w-7 px-2 py-1 rounded-full">
              {averageRating}
          </span>
          <span className="flex mt-6 text-oscuro3/75">
              {city}ciudad, {country}pais
          </span>
      </div> */}
    </Link>
  )
}