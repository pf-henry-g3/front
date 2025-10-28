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
    <div className="mt-32 gap-16">
      <div className="w-[67%] mx-auto bg-oscuro2 rounded-4xl shadow-xl py-1.5 px-2">
        <HorizontalScroller>
          {bands.map((band) => (
            <Link
              href={`/quotes`}
              key={band.id}
              className="shrink-0 w-64 flex justify-center snap-start"
            >
              <BandsPreviewCard
                name={band.name}
                image={band.image}
                location={band.location}
                val={band.val}
              />
            </Link>
          ))}
        </HorizontalScroller>
      </div>

      <div className="w-[67%] mx-auto mt-8">
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