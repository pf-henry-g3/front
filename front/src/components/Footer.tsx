/* eslint-disable @next/next/no-img-element */

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full border-t bg-linear-to-t from-oscuro3 via-oscuro2 to-oscuro1 mt-24 px-6 py-8">
      <div className="max-w-[68%] mx-auto flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
        <div className="flex flex-col items-center md:items-start gap-2">
          <h3 className="text-xl font-bold text-txt1">Sincro</h3>
          <p className="text-sm text-txt2 max-w-sm text-center md:text-left">
            Conecta con músicos, publica vacantes y encuentra colaboradores para tu próximo proyecto.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link href="/" className="text-sm text-txt1 hover:text-tur2 transition">
            Inicio
          </Link>
          <Link href="/home" className="text-sm text-txt1 hover:text-tur2 transition">
            Home
          </Link>
          <Link href="/artistsPreview" className="text-sm text-txt1 hover:text-tur2 transition">
            Artistas
          </Link>
          <Link href="/quotesPreview" className="text-sm text-txt1 hover:text-tur2 transition">
            Vacantes
          </Link>
          <Link href="/myBands" className="text-sm text-txt1 hover:text-tur2 transition">
            Mis Bandas
          </Link>
        </div>

        <div className="flex flex-col items-center md:items-end gap-3">
          <div className="flex items-center gap-3">
            <img
              alt="Facebook"
              className="w-8 rounded-full"
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSDy_BNkPSR9l2X5I074rtb6j-z-i2Iz2yblw&s"
            />
            <img
              alt="X"
              className="w-8 rounded-full"
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/X_logo.jpg/500px-X_logo.jpg"
            />
            <img
              alt="Instagram"
              className="w-8 rounded-full"
              src="https://upload.wikimedia.org/wikipedia/commons/9/95/Instagram_logo_2022.svg"
            />
          </div>
          <span className="text-xs text-txt2">© {new Date().getFullYear()} Sincro. Todos los derechos reservados.</span>
        </div>
      </div>
    </footer>
  );
}