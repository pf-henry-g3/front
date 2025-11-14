/* eslint-disable @next/next/no-img-element */
import IUserPreviewCardProps from "../interfaces/IUserPreviewCardProps"

export default function ArtistsPreviewCard ({ profilePicture, userName, country, averageRating }: IUserPreviewCardProps) {

  return (
    <div className="flex flex-col rounded-md bg-azul shadow-md gap-2 transform hover:shadow-lg hover:-translate-y-1 duration-100">
      <img
        src={profilePicture}
        alt={userName}
        className="rounded-t-md w-5xl h-5xl"
      />
      <div className="flex flex-col">
        <h1 className="text-txt1 font-bold text-xl text-shadow-md px-2">{userName}</h1>
        <div className="flex flex-row justify-between px-2 mb-1" >
          <h4 className="text-txt2 font-medium text-shadow-sm mt-0.5">{country}</h4>
          <h3 className="text-tur2 text-xl font-semibold text-shadow-lg">{averageRating}</h3>
        </div>
      </div>
    </div>
  )
}

