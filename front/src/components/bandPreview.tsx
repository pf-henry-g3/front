/* eslint-disable @next/next/no-img-element */
import IBandPreviewProps from "../interfaces/IBandPreviewProps";

export default function ProductCard({ name, image, place, val }: IBandPreviewProps) {
  return (
    <div className="w-50 h-90 border rounded-xl shadow-xl p-3 flex flex-col items-center gap-3 bg-white transition hover:shadow-xl hover:-translate-y-1 duration-200">
      <h2 className="my-auto text-xl font-semibold text-gray-800">{name}</h2>
      <img
        src={image}
        alt={name}
        className="h-40 my-auto object-cover"
      />
      <span className="my-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition" >
        Info
      </span>
    </div>
  );
}