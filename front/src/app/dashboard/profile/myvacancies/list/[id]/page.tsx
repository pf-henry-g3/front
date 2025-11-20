'use client'

import IVacancy from "@/src/interfaces/IVacancy";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

interface IAplication {
    username: string,
    urlImage: string,
}
export default function List() {
    const router = useRouter();
    const [vacancy, setVacancy] = useState<IVacancy>();
    const [aplication, setAplication] = useState<IAplication[]>([]);
    const params = useParams();

    useEffect(() => {
        async function fetchVacancy() {
            try {
                const token = localStorage.getItem('access_token');

                if (!token) {
                    await Swal.fire({
                        icon: "warning",
                        title: "Sesión requerida",
                        text: "Debes iniciar sesión para crear bandas",
                        confirmButtonColor: "#F59E0B"
                    });
                    router.push('/login');
                    return;
                }

                const storedUser = localStorage.getItem("user");
                if (!storedUser) return;

                const parsedUser = JSON.parse(storedUser);
                const id = parsedUser.id;

                if (!id) {
                    console.log("no se ha encontrado el id de usuario");
                    return;
                }

                console.log("id del usuario", id);

                const base = (process.env.NEXT_PUBLIC_BACKEND_URL ?? process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/+$/, '');

                const vacancyId = params.id as string;
                const res = await axios.get(
                    `${base}/vacancy/${vacancyId}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }

                );
                console.log("vacancy del usuario traidas con exito");
                console.log("Respuesta del backend:", res.data);

                const aplicante = await axios.get(
                    `${base}/vacancy/getAllApplications/${vacancyId}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );



                console.log("Respuesta del getAllAplications:", aplicante);



                const vacArray = Array.isArray(aplicante.data?.data) ? aplicante.data.data : [];

                console.log(vacArray);
                setAplication(vacArray)
                console.log('a: ', aplication);


                setVacancy(res.data.data);

            } catch (err) {
                console.log(err);
            }
        }

        fetchVacancy();
    }, []);
    return (
        <div className="flex-col mt-28">
            <h1>Vacante:</h1>
            <h2>{vacancy?.name}</h2>
            <p>{vacancy?.vacancyDescription}</p>
            <h1>Aplication</h1>
            <h2>{aplication.map((a) => (

                <h3>{a.username}</h3>)
            )}</h2>
        </div>

    )

}