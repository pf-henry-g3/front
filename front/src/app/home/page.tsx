import Filterproduct from "@/src/components/Filter";




export default function HomePage () {
  
    return (
        <div className="pt-20 pb-20 px-4">
            <h1 className="text-amber-200 text-center text-3xl mb-8">Búsqueda de Productos</h1>

           <Filterproduct />
        </div>
    ) 
}