import { IEvent } from "@/src/interfaces/IEvent";
import { mockData } from "@/src/mocks/EventMock";
import { bandMockData } from "@/src/mocks/BandMock";
import { IBand } from "@/src/interfaces/IBand";
import Link from "next/link";
import BandsPreviewCard from "@/src/components/BandsPreviewCard";
import EventPreviewCard from "@/src/components/eventPreviewCard";
import HorizontalScroller from "@/src/components/HorizontalScroller";

export default function QuotesPreviewPage() {
  const bands: IBand[] = bandMockData;
  const quotes: IEvent[] = mockData;

  return (
    <div className="mt-32">
      <h1 className="text-txt1 font-bold text-center text-3xl text-shadow-md mb-4">Algunas de nuestras bandas registradas...</h1>
      <div className="w-[75%] mx-auto mb-16 rounded-4xl py-1.5 px-2">
        <HorizontalScroller>
          {bands.map((band) => (
            <Link
              href={`/home`}
              key={band.id}
              className="shrink-0 w-64 flex justify-center snap-start"
            >
              <BandsPreviewCard
                name={band.name}
                image={band.bandImage}
              />
            </Link>
          ))}
        </HorizontalScroller>
      </div>
    <h1 className="text-txt1 font-bold text-center text-3xl text-shadow-md mb-4">¡Participa en eventos creados por las mismas bandas!</h1>
      <div className="w-[75%] mx-auto rounded-4xl py-1.5 px-2">
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
  );
}