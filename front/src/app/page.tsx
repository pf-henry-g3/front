/* eslint-disable @next/next/no-img-element */
import Link from "next/link";

export default function LandingPage() {
  return (
    <main>
      <div className="flex flex-col justify-center text-center w-[70%] mx-auto my-24 gap-1.5">
        <h1 className="text-txt1 text-3xl font-bold">
          Encuentra músicos y bandas para colaborar
        </h1>
        <p className="text-txt2 mx-auto w-[50%] text-md">
          Conecta con otros artistas, descubre proyectos y oportunidades para colaborar en tu próxima canción.
        </p>
        <div className="flex flex-row gap-2 justify-around mx-auto mt-8 w-[40%]">
          <Link
          className="bg-tur1 py-1.5 px-4 rounded-md text-azul text-lg font-sans shadow-xl transition duration-300  hover:bg-tur2 hover:text-oscuro2 hover:-translate-y-0.5 hover:cursor-pointer"
          href={"/quotesPreview"}
          >
          Soy artista
          </Link>
          <Link
          className="py-1.5 rounded-md px-4 text-tur3 text-lg font-sans border-fondo1 transition duration-400 hover:bg-tur3 hover:border-verde hover:text-azul hover:-translate-y-0.5 hover:cursor-pointer"
          href={"/artistsPreview"}
          >
          Busco artista
          </Link>
        </div>
        <img 
          className="w-lg mx-auto my-12"
          src="https://ohmagazinerd.com/wp-content/uploads/2020/08/47601C44-9EF0-452C-8D19-90B9E91C7297-2.png"
          alt="img"
        />
        <div className="flex flex-row justify-around">
          <div className="flex flex-col w-[30%] gap-1">
            <h2 className="text-tur2 text-3xl font-semibold">
              ❖
            </h2>
            <h3 className="text-txt1 text-xl font-bold">
              Características
            </h3>
            <p className="text-txt2 text-md">
              Crea tu perfi, destaca tus habilidades y experiencias.
            </p>
          </div>
          <div className="flex flex-col w-[30%] gap-1">
            <h2 className="text-tur2 text-3xl font-semibold">
              ϟ 
            </h2>
            <h3 className="text-txt1 text-xl font-bold">
              ¿Cómo funciona?
            </h3>
            <p className="text-txt2 text-md">
              Publica vacantes o busca artistas que se ajusten a tus necesidades.
            </p>
          </div>
          <div className="flex flex-col w-[30%] gap-1">
            <h2 className="text-tur2 text-3xl font-semibold">
              ✛ 
            </h2>
            <h3 className="text-txt1 text-xl font-bold">
              Únete hoy
            </h3>
            <p className="text-txt2 text-md">
              Registrate gratis y comienza a conectar con otros músicos ahora mismo.
            </p>
          </div>
        </div>
        <div className="flex flex-row justify-around w-[80%] mx-auto mt-16">
          <div className="flex flex-col">
            <h2 className="text- text-2xl font-bold">
              ¿Deseas ver más?
            </h2>
            <Link
            className="py-1.5 px-4 text-tur3 text-xl font-sans transition duration-400 hover:text-tur2 hover:cursor-pointer"
            href={"/home"}
            >
              ↪ Explorar 
            </Link>
          </div>
          <div className="flex flex-col">
            <h2 className="text-txt1 text-2xl font-bold">
              ¿Listo para empezar?
            </h2>
            <Link
            className="py-1.5 px-4 text-tur3 text-xl font-sans transition duration-400 hover:text-tur2 hover:cursor-pointer"
            href={"/login"}
            >
              ↪ Registrarse 
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

