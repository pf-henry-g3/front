import Filterproduct from "@/src/components/Filter";
{/* import BandDetail from "@/src/components/BandDetail"; */}



export default function HomePage () {

    return (
        <div className="py-30 px-4 flex flex-row justify-around">
            <div className="flex flex-col">

                <h1 className="text-txt1 text-3xl font-bold text-center">Búsqueda de Bandas</h1>
                <Filterproduct />

            </div>

            {/* <BandDetail /> */}

        </div>
    ) 
}