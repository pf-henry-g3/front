import Link from "next/link";
import AuthButtons from "./AuthButtons";
import DonationButton from "./DonationButton";
import VacantButton from "./VacantButton";
import BandButton from "./BandButton";


export default function NavBar() {

    return (

        <nav className='fixed top-0 w-full flex items-center justify-center py-4 px-6 md:px-12 lg:px-24 border-b backdrop-blur-md shadow-lg z-50'>

            <div className="absolute left-6 md:left-12 lg:left-24">

                {/* <Link href="/" className="flex align-middle">
                    <img 
                    src="/syncro.jpg"
                    alt="SyncroLogo" 
                    className="w-10 h-10 rounded-full object-contain" />
                </Link> */}
                <Link href="/">

                    <div className="flex items-center justify-center"> <span className="text-txt1 text-3xl font-bold text-center">SYNCRO</span></div>

                </Link>

            </div>

            <span className='flex items-center justify-center space-x-8'>

                <Link href="/home ">

                    <div className="flex items-center justify-center">
                        <span className="
                        text-md text-text2 font-sans shadow-xl transition duration-300 hover:text-tur2 hover:cursor-pointer flex items-center gap-2">Busqueda</span></div>

                </Link>

                <VacantButton />

                <DonationButton />

            </span>

            <div className="absolute right-6 md:right-12 lg:right-24">

                <AuthButtons />

            </div>

        </nav>

    )

}