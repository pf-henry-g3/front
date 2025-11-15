import Link from "next/link";
import IMyBandPreviewDetailProps from "../interfaces/IMyBandPreviewDetailProps";


export default function MyBandPreview ({id, name, formationYear, bandImage, description}: IMyBandPreviewDetailProps) {
  return (
    <Link 
      className="flex items-center bg-white/95 hover:bg-white/55 transition gap-4 rounded-xl p-4 shadow-xl"
      href={`/band/${id}`}
    >
      <img 
          src={bandImage || '/default-image.jpg'} 
          alt={name}
          className="w-14 h-14 rounded-full object-cover shrink-0 border-2 border-tur3/30 shadow-md"
          />
      <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg text-oscuro1 truncate drop-shadow-sm">{name}</h3>
          <p className="text-oscuro2 text-xs line-clamp-1 mt-1">{description}Esta es una descripcion de prueba</p>
      </div>
      <div className="mt-3 text-right">
          <span className="text-xs text-oscuro2 font-medium bg-tur2/20 px-2 py-1 rounded-full">
              {formationYear} Formada en 2020
          </span>
      </div>
    </Link>
  )
}