import { bandMockData } from "@/src/mocks/BandMock";
import { IBand } from "@/src/interfaces/IBand";
import BandsPreviewCard from "@/src/components/BandsPreviewCard";
import HorizontalScroller from "../components/HorizontalScroller";
import Link from "next/link";

export default function BandsPreview () {
  const bands: IBand[] = bandMockData;

  return (
    <div>
      <h1 className="text-txt1 mt-16 font-bold text-center text-3xl text-shadow-md mb-4 ">Algunas de nuestras bandas registradas...</h1>
      <div className="mx-auto max-w-[83%] rounded-4xl py-1.5 px-2">
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
    </div>
  )
}