/* eslint-disable @next/next/no-img-element */
import IBandPreviewCardProps from "../interfaces/IBandPreviewCardProps";


export default function BandsPreviewCard ({ name, image, location, val }: IBandPreviewCardProps) {
  return (
    <div className="flex flex-col rounded-md bg-azul shadow-md gap-2 transform hover:shadow-lg hover:-translate-y-1 duration-100">
      <img
        src={image}
        alt={name}
        className="rounded-t-md"
      />
      <div className="flex flex-col">
        <h1 className="text-txt1 font-bold text-2xl text-shadow-md pl-2">{name}</h1>
        <div className="flex flex-row justify-between px-2 mb-1">
          <h4 className="text-txt2 font-medium text-shadow-sm mt-0.5">{location}</h4>
          <h3 className="text-tur2 text-xl font-semibold text-shadow-lg">{val}/10 ★</h3>
        </div>
      </div>
    </div>
  );
}