import { useState } from "react";
import { mockData } from "../mocks/Product";

export default function ProductCard () {
    
        
    return (

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {mockData.map(item => (
                                <div key={item.id} className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
                                    <h3 className="font-semibold text-lg text-gray-800">{item.name}</h3>
                                    <p className="text-gray-600 text-sm">{item.category}</p>
                                    <p className="text-green-600 font-bold text-xl mt-2">${item.event}</p>
                                </div>
                            ))}
                        </div>
    )     
}

