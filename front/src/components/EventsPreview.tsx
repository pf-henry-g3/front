import HorizontalScroller from "../components/HorizontalScroller";
import { IEvent } from "@/src/interfaces/IEvent";
import { mockData } from "@/src/mocks/EventMock";
import EventPreviewCard from "@/src/components/eventPreviewCard";
import Link from "next/link";

export default function EventsPreview () {
  const quotes: IEvent[] = mockData;

  return (
    <div>
      <h1 className="text-txt1 font-bold text-center text-3xl text-shadow-md mb-4 mt-16">¡Participa en eventos creados por las mismas bandas!</h1>
      <div className="mx-auto max-w-[83%] rounded-4xl py-1.5 px-2">
        <HorizontalScroller>
          {quotes.map((quote) => (
            <Link
            href={`/home`}
            key={quote.id}
            className="shrink-0 w-64 flex justify-center snap-start"
            >
              <EventPreviewCard
                name={quote.name} 
                event={quote.event}
                image={quote.image} 
                date={quote.date}
                />
            </Link>
          ))}
        </HorizontalScroller>
      </div>
    </div>
  )
}