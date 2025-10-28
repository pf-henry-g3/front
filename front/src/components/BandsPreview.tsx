/* eslint-disable @next/next/no-img-element */
import IBandPreviewProps from "../interfaces/IBandPreviewProps";


export default function BandsPreview ({ name, image, location, val }: IBandPreviewProps) {
  return (
    <div className="">
      <h2 className="">{name}</h2>
      <img
        src={image}
        alt={name}
        className=""
      />
      <span className="" >
        Info
      </span>
    </div>
  );
}