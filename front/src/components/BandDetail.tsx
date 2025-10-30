/* eslint-disable @next/next/no-img-element */
import IBandDetailProps from "../interfaces/IBandDetailProps"

export default function BandDetail ({ name, bandImage, bandDescription, formationDate }:IBandDetailProps) {
  return (
    <div className="flex flex-col w-[35%] p-8 shadow-xl bg-azul rounded-xl">
      <div className="flex flex-row">
        <img
        className="w-48 h-48 rounded-full border-5 border-oscuro3"
        src={bandImage}
        alt={name}
        />
        <div className="flex flex-col px-4">
          <h1 className="text-txt1 font-bold text-3xl"> {name}</h1>
          <h3 className="text-txt2 font-light text-xl">{formationDate}</h3>
          <p className="text-txt1 font-medium text-lg">{bandDescription}</p>
        </div>
      </div>
    </div>
  )
}