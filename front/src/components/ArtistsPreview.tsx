import ArtistsPreviewCard from "./artistsPreviewCard";
import IUser from "../interfaces/IUser";
import { userMockData } from "../mocks/UserMock";
import HorizontalScroller from "./HorizontalScroller";
import Link from "next/link";

export default function ArtistsPreview () {
  const artists: IUser[] = userMockData;

  return (
    <div className="mt-16">
      <h1 className="text-txt1 font-bold text-center text-3xl text-shadow-md mb-4">Nuestros preciados artistas</h1>
      <div className="mx-auto max-w-[83%] rounded-4xl py-1.5 px-2">
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
  )
}