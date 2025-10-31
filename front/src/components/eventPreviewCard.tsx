/* eslint-disable @next/next/no-img-element */
import IEventPreviewCardProps from "../interfaces/IEventPreviewCardProps"

export default function EventPreviewCard ({ event, name, date, image }: IEventPreviewCardProps) {
  const formattedDate = date instanceof Date ? date.toLocaleDateString() : String(date);

  return (
    <div className="flex flex-col rounded-md bg-azul shadow-md gap-2 transform hover:shadow-lg hover:-translate-y-1 duration-100">
      <img
        src={image}
        alt={event}
        className="rounded-t-md"
      />
      <div className="flex flex-col">
        <h1 className="text-txt1 font-bold text-xl text-shadow-md px-2">{event}</h1>
        <div className="flex flex-row justify-between items-end px-2 mb-1" >
          <h4 className="text-txt2 font-medium text-shadow-sm mt-0.5">{name}</h4>
          <h3 className="text-tur2 text-xl font-semibold text-shadow-lg">{formattedDate}</h3>
        </div>
      </div>
    </div>
  )
}

