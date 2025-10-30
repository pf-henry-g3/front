import HorizontalScroller from "@/src/components/HorizontalScroller";
import IUser from "@/src/interfaces/IUser";
import { userMockData } from "@/src/mocks/UserMock";
import Link from "next/link";
import ArtistsPreviewCard from "@/src/components/artistsPreviewCard";

export default function ArtistsPreviewPage () {

    const artists: IUser[] = userMockData;

  return (
    <div className="mt-32">
      <h1 className="text-txt1 font-bold text-center text-3xl text-shadow-md mb-4">Nuestros preciados artistas</h1>
      <div className="w-[75%] mx-auto mb-16 rounded-4xl py-1.5 px-2">
        <HorizontalScroller>
          {artists.map((artist) => (
            <Link
              href={`/home`}
              key={artist.id}
              className="shrink-0 w-64 flex justify-center snap-start"
            >
              <ArtistsPreviewCard
                userName={artist.userName}
                profilePicture={artist.profilePicture}
                country={artist.country}
                averageRating={artist.averageRating}
              />
            </Link>
          ))}
        </HorizontalScroller>
      </div>
    </div>
  );
}