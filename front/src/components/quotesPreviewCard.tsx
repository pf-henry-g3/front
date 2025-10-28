/* eslint-disable @next/next/no-img-element */
import IQuotesPreviewCardProps from "../interfaces/IQuotesPreviewCardProps"

export default function QuotesPreviewCard ({ event, name, date }: IQuotesPreviewCardProps) {
  return (
    <div className="flex flex-col rounded-md bg-azul shadow-md gap-2 transform hover:shadow-2xl hover:-translate-0.5 duration-100">
      <img
        //src={image}
        alt={event}
        className="rounded-t-md"
      />
      <div className="flex flex-row justify-between px-2 pb-2" >
        <div className="flex flex-col">
          <h1 className="text-txt1 font-bold text-2xl text-shadow-md">{event}</h1>
          <h4 className="text-txt2 font-medium text-shadow-sm">{name}</h4>
        </div>
        <h3 className="text-tur2 text-xl font-semibold mt-0.5 text-shadow-lg">{date}</h3>
      </div>
    </div>
  )
}

