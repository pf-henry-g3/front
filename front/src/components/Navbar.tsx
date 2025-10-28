import Link from "next/link";

export default function NavBar () {

        return (

            <nav className='fixed top-0 w-full flex items-center justify-center py-4 px-6 md:px-12 lg:px-24 border-b backdrop-blur-md shadow-lg z-50'>

              <div className="absolute left-6 md:left-12 lg:left-24">

                <Link href="/">

                <div className="flex items-center justify-center"> <span className="text-center">Sincro</span></div>    
                
                </Link>

                </div>

  

            <span className='flex items-center justify-center space-x-8'>

            <Link href="/home">

            <div className="flex items-center justify-center"> <span className="text-center">Home</span></div>

            </Link>

            <Link href="/dashboard">

            <div className="flex items-center justify-center"> <span className="text-center">Dashboard</span></div>

            </Link>

            </span>

  

        </nav>

    )

}