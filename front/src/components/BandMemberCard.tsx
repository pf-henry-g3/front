interface MemberProps {
  userImage: string,
  userName: string,
  averageRating: string,
}

export default function BandMemberCard({ userImage, userName, averageRating }:MemberProps ) {
  return (
    <div className="flex flex-row bg-tur2/40 items-center shadow-md justify-between rounded-full w-[67%] mx-auto px-1.5">
      <span className="flex flex-row items-center gap-3">
        <img
          src={userImage || '/default-image.jpg'} 
          alt={userName}
          className="w-16 h-16 rounded-full  my-1.5 object-cover shrink-0 border-2 border-tur3/30 shadow-md"
          />
        <h4 className="text-oscuro3 font-semibold text-2xl text-shadow-md">
          {userName}
        </h4>
      </span>
        <p className="mr-4 font-bold text-txt1 text-3xl text-shadow-md">
          {averageRating}
        </p>
    </div>
  );
}