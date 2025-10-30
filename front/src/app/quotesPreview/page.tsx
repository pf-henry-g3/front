import { IProduct } from "@/src/interfaces/IProduct";
import { mockData } from "@/src/mocks/Product";
import { bandMockData } from "@/src/mocks/BandMock";
import IBand from "@/src/interfaces/IBand";
import Link from "next/link";
import BandsPreviewCard from "@/src/components/BandsPreviewCard";
import QuotesPreviewCard from "@/src/components/quotesPreviewCard";
import HorizontalScroller from "@/src/components/HorizontalScroller";

export default function QuotesPreviewPage() {
  const bands: IBand[] = bandMockData;
  const quotes: IProduct[] = mockData;

  return (
    <div className="mt-32">
      <h1 className="text-txt1 font-bold text-center text-3xl text-shadow-md mb-4">Algunas de nuestras bandas registradas...</h1>
      <div className="w-[75%] mx-auto mb-16 rounded-4xl py-1.5 px-2">
        <HorizontalScroller>
          {bands.map((band) => (
            <Link
              href={`/quotes`}
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
              href={`/quotes`}
              key={quote.id}
              className="shrink-0 w-64 flex justify-center snap-start"
            >
              <QuotesPreviewCard
                name={quote.name} 
                event={quote.event}
                //image={quote.image} 
                date={quote.date}
              />
            </Link>
          ))}
        </HorizontalScroller>
      </div>
    </div>
  );
}