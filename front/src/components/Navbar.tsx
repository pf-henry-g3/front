import Link from "next/link";
import AuthButtons from "./AuthButtons";

export default function NavBar () {

        return (

            <nav className='fixed top-0 w-full flex items-center justify-center py-4 px-6 md:px-12 lg:px-24 border-b backdrop-blur-md shadow-lg z-50'>

              <div className="absolute left-6 md:left-12 lg:left-24">

                <Link href="/">

                <div className="flex items-center justify-center"> <span className="text-txt1 text-3xl font-bold text-center">SINCRO</span></div>    
                
                </Link>

                </div>

  

            <span className='flex items-center justify-center space-x-8'>

            <Link href="/home">

            <div className="flex items-center justify-center"> <span className="text-center">Home</span></div>

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
            </span>

            <div className="absolute right-6 md:right-12 lg:right-24">

            <AuthButtons />

            </div>

  

        </nav>

    )

}