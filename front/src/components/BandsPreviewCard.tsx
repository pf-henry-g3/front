/* eslint-disable @next/next/no-img-element */
import IBandPreviewCardProps from "../interfaces/IBandPreviewCardProps";


export default function BandsPreviewCard ({ name, image, }: IBandPreviewCardProps) {
  return (
    <div className="flex flex-col rounded-md bg-azul shadow-md gap-2 transform hover:shadow-lg hover:-translate-y-1 duration-100">
      <img
        src={image}
        alt={name}
        className="rounded-t-md"
      />
      <h1 className="text-txt1 font-bold text-2xl text-shadow-md pl-2">{name}</h1>
    </div>
  );
}