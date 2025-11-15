import Link from "next/link";

export default function VerificatedPage () {
  return (
    <div className="flex flex-col text-center mx-auto w-lg min-h-screen mt-32 gap-1">
      <h1 className="text-txt1 text-3xl">Gracias por registrarte!</h1>
      <p className="text-txt2 text-xl">Tu cuenta ha sido verificada correctamente</p>
      <Link
      href={"/home"}
      className="bg-tur1 py-1.5 px-4 mt-8 rounded-md min-w-65 max-w-70 mx-auto text-azul text-2xl font-sans shadow-xl transition duration-300 hover:bg-tur2 hover:text-oscuro2 hover:-translate-y-0.5 hover:cursor-pointer flex items-center gap-2"
      >↪ Seguir explorando</Link>
    </div>
  )
}