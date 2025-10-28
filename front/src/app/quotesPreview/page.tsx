import BandsPreview from "@/src/components/BandsPreview";
import { IProduct } from "@/src/interfaces/IProduct";
import { mockData } from "@/src/mocks/Product";
import { bandMockData } from "@/src/mocks/BandMock";
import IBand from "@/src/interfaces/IBand";
import Link from "next/link";
import QuotesPreview from "@/src/components/quotesPreview";
import HorizontalScroller from "@/src/components/HorizontalScroller";

export default function QuotesPreviewPage() {
  const bands: IBand[] = bandMockData;
  const quotes: IProduct[] = mockData;

  return (
    <div className="mt-32 gap-16">
      <div className="w-[67%] mx-auto">
        <HorizontalScroller>
          {bands.map((band) => (
            <Link
              href={`/bandDetail/${band.id}`}
              key={band.id}
              className="shrink-0 w-64 flex justify-center snap-start"
            >
              <BandsPreview
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
              href={`/bandDetail/${quote.id}`}
              key={quote.id}
              className="shrink-0 w-64 flex justify-center snap-start"
            >
              <QuotesPreview name={quote.name} location={quote.location} />
            </Link>
          ))}
        </HorizontalScroller>
      </div>
    </div>
  );
}