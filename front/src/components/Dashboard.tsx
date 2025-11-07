// 'use client';

// import { useUser } from '@auth0/nextjs-auth0/client';
// import { useEffect, useState } from 'react';
// import { useApi } from '../context/ApiContext';

// export default function Dashboard() {
//   const { user, isLoading } = useUser();
//   const { fetchWithAuth } = useApi();
//   const [data, setData] = useState(null);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     async function loadData() {
//       try {
//         const result = await fetchWithAuth('/api/users/profile');
//         setData(result);
//       } catch (err: any) {
//         setError(err.message);
//       }
//     }

//     if (user) {
//       loadData();
//     }
//   }, [user, fetchWithAuth]);

//   if (isLoading) return <div>Cargando...</div>;
//   if (!user) return <a href="/api/auth/login">Login</a>;
//   if (error) return <div>Error: {error}</div>;

//   return (
//     <div>
//       <h1>Bienvenido {user.name}</h1>
//       <pre>{JSON.stringify(data, null, 2)}</pre>
//     </div>
//   );
// }