'use client';

import BandButton from '@/src/components/BandButton';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import Swal from 'sweetalert2';

interface IUser {
  id: string;
  email: string;
  userName: string;
  name: string;
  birthDate?: string;
  aboutMe?: string;
  city?: string;
  country?: string;
  address?: string;
  urlImage?: string;
  genres?: Array<{ id: string; name: string }>;
  roles?: Array<{ id: string; name: string }>;
}

interface IGenre {
  id: string;
  name: string;
}

export default function ProfileEditForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [availableGenres, setAvailableGenres] = useState<IGenre[]>([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    userName: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    aboutMe: '',
    city: '',
    country: '',
    address: '',
    newGenres: [] as string[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const userData = localStorage.getItem('user');

        if (!token || !userData) {
          console.warn('⚠️ No hay token disponible');
          await Swal.fire({
            icon: "warning",
            title: "Sesión requerida",
            text: "Debes iniciar sesión para crear bandas",
            confirmButtonColor: "#F59E0B"
          });
          router.push('/login');
          return;
        }

        const parsedUser: IUser = JSON.parse(userData);
        setUser(parsedUser);
        setPhotoPreview(parsedUser.urlImage || '');

        setFormData({
          userName: parsedUser.userName || '',
          name: parsedUser.name || '',
          email: parsedUser.email || '',
          password: '',
          confirmPassword: '',
          aboutMe: parsedUser.aboutMe || '',
          city: parsedUser.city || '',
          country: parsedUser.country || '',
          address: parsedUser.address || '',
          newGenres: parsedUser.genres?.map(g => g.id) || [],
        });

        const genresResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/genre`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!genresResponse.ok) throw new Error('Error cargando géneros');

        const genresData = await genresResponse.json();
        const genres = genresData?.data || genresData || [];
        setAvailableGenres(genres);

      } catch (error: any) {
        console.error('Error cargando datos:', error);
        console.warn('⚠️ No se pudo cargar la información del perfil');
        await Swal.fire({
          icon: "warning",
          title: "Error",
          text: "No se pudo cargar la información del perfil",
          confirmButtonColor: "#F59E0B"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const validateField = (name: string, value: string) => {
    let error = '';

    switch (name) {
      case 'userName':
        if (value && value.length < 3) error = 'Mínimo 3 caracteres';
        if (value && value.length > 50) error = 'Máximo 50 caracteres';
        break;
      case 'name':
        if (value && value.length < 2) error = 'Mínimo 2 caracteres';
        if (value && value.length > 100) error = 'Máximo 100 caracteres';
        break;
      case 'email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'Email inválido';
        }
        break;
      case 'password':
        if (value && value.length < 8) error = 'Mínimo 8 caracteres';
        if (value && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(value)) {
          error = 'Debe contener mayúscula, minúscula, número y carácter especial';
        }
        break;
      case 'confirmPassword':
        if (value !== formData.password) error = 'Las contraseñas no coinciden';
        break;
      case 'aboutMe':
        if (value && value.length > 500) error = 'Máximo 500 caracteres';
        break;
      case 'city':
      case 'country':
        if (value && value.length > 100) error = 'Máximo 100 caracteres';
        break;
      case 'address':
        if (value && value.length > 200) error = 'Máximo 200 caracteres';
        break;
    }

    return error;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('access_token');

      if (!token || !user) {
        console.warn('⚠️ No hay token disponible');
        await Swal.fire({
          icon: "warning",
          title: "Sesión requerida",
          text: "Debes iniciar sesión para crear bandas",
          confirmButtonColor: "#F59E0B"
        });
        router.push('/login');
        return;
      }

      const newErrors: Record<string, string> = {};
      Object.keys(formData).forEach(key => {
        const error = validateField(key, (formData as any)[key]);
        if (error) newErrors[key] = error;
      });

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setTouched(Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
        return;
      }

      setSubmitting(true);

      const genreNames = formData.newGenres.map(genreId => {
        const genre = availableGenres.find(g => g.id === genreId);
        return genre?.name || '';
      }).filter(name => name !== '');

      const updatePayload: any = {};

      if (formData.userName && formData.userName !== user.userName) updatePayload.userName = formData.userName;
      if (formData.name && formData.name !== user.name) updatePayload.name = formData.name;
      if (formData.password) {
        updatePayload.password = formData.password;
        updatePayload.confirmPassword = formData.confirmPassword;
      }
      if (formData.aboutMe !== user.aboutMe) updatePayload.aboutMe = formData.aboutMe;
      if (formData.city !== user.city) updatePayload.city = formData.city;
      if (formData.country !== user.country) updatePayload.country = formData.country;
      if (formData.address !== user.address) updatePayload.address = formData.address;
      if (genreNames.length > 0) updatePayload.newGenres = genreNames;

      console.log('📤 Datos a actualizar:', updatePayload);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/${user.id}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatePayload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || 'Error actualizando perfil');
      }

      const responseData = await response.json();

      const updatedUser = { ...user, ...responseData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      await Swal.fire({
        icon: "success",
        title: "Perfil actualizado!",
        text: "✅ ¡Perfil actualizado correctamente!",
        confirmButtonText: "Continuar",
        confirmButtonColor: "#10B981",
        timer: 2000
      });

      setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));

    } catch (error: any) {
      console.error('❌ Error: ' + (error.message || 'No se pudo actualizar el perfil'));
      await Swal.fire({
        icon: "warning",
        title: "Error",
        text: ('No se pudo actualizar el perfil' + error.message),
        confirmButtonColor: "#F59E0B"
      });
    }
    finally {
      setSubmitting(false);
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const maxSize = 200000; // 200kb
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (file.size > maxSize) {
      await Swal.fire({
        icon: "warning",
        title: "Tamaño inválido",
        text: "❌ La imagen debe ser máximo de 200kb",
        confirmButtonColor: "#F59E0B"
      });
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      console.error('❌ Solo se permiten imágenes JPG, JPEG, PNG o WEBP');
      await Swal.fire({
        icon: "warning",
        title: "Formato inválido",
        text: "❌ Solo se permiten imágenes JPG, JPEG, PNG o WEBP",
        confirmButtonColor: "#F59E0B"
      });
      return;
    }

    try {
      const token = localStorage.getItem('access_token');

      if (!token || !user) {
        await Swal.fire({
          icon: "warning",
          title: "Sesión requerida",
          text: "Debes iniciar sesión.",
          confirmButtonColor: "#F59E0B"
        });
      }

      setUploadingPhoto(true);

      const formDataUpload = new FormData();
      formDataUpload.append('file', file);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/photo/${user.id}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formDataUpload,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || 'Error subiendo foto');
      }

      const responseData = await response.json();
      const newPhotoUrl = responseData?.urlImage || responseData?.url || responseData;

      setPhotoPreview(newPhotoUrl);

      const updatedUser = { ...user, urlImage: newPhotoUrl };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      await Swal.fire({
        icon: "success",
        title: "Foto Actualizada",
        text: "✅ ¡Foto actualizada correctamente!",
        confirmButtonColor: "#10B981"
      });

    } catch (error: any) {
      console.error('Error subiendo foto:', error);
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo subir la foto",
        confirmButtonColor: "#F59E0B"
      });

    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleGenreToggle = (genreId: string) => {
    const currentGenres = formData.newGenres;
    const isSelected = currentGenres.includes(genreId);

    if (isSelected) {
      setFormData(prev => ({
        ...prev,
        newGenres: currentGenres.filter(id => id !== genreId),
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        newGenres: [...currentGenres, genreId],
      }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-xl text-gray-600">Cargando perfil...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-gray-600">Redirigiendo...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-fondo1 via-fondo2 to-fondo3 pt-26 px-4 sm:px-6 lg:px-8">
      <div className="container max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="jsx-f082eaee8797ef3b text-4xl font-bold text-txt1 mb-2">👤 Editar Perfil</h2>
          <p className="jsx-f082eaee8797ef3b text-txt2 text-lg">Actualiza tu información personal</p>
          <div className='flex justify-center mt-3'>
            < BandButton />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-3xl shadow-2xl p-8 md:p-10 lg:p-12">

          {/* Foto de perfil */}
          <div className="mb-10 text-center">
            <div className="relative inline-block group">
              <img
                src={photoPreview || 'https://via.placeholder.com/200x200?text=Sin+Foto'}
                alt="Foto de perfil"
                className="w-48 h-48 rounded-full object-cover border-4 border-tur3 shadow-xl transition-all duration-300 group-hover:border-tur2 group-hover:shadow-2xl"
              />
              {uploadingPhoto && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 rounded-full">
                  <div className="text-white text-lg font-semibold">Subiendo...</div>
                </div>
              )}
            </div>

            <div className="mt-6">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handlePhotoUpload}
                className="hidden"
                id="photo-upload"
              />
              <label
                htmlFor="photo-upload"
                className="jsx-fd0de145dd41e0c2 inline-block px-8 py-4 bg-gradient-to-r from-tur2 to-oscuro1 text-white font-bold text-lg rounded-xl cursor-pointer hover:from-oscuro1 hover:to-tur2 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                📷 Cambiar Foto
              </label>
              <p className="mt-3 text-sm text-gray-500">
                JPG, JPEG, PNG o WEBP (máx. 200kb)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

            {/* Géneros - Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6 lg:sticky lg:top-6">
                <label className="block text-2xl font-bold text-gray-900 mb-4">
                  🎵 Géneros Musicales
                </label>
                <p className="text-sm text-gray-600 mb-4">
                  Selecciona tus géneros favoritos
                </p>

                <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                  {availableGenres.map((genre) => {
                    const isSelected = formData.newGenres.includes(genre.id);

                    return (
                      <label
                        key={genre.id}
                        className={`flex items-center p-4 rounded-xl cursor-pointer transition-all duration-300 border-2 ${isSelected
                          ? 'bg-tur2 border-oscuro3-500 shadow-lg transform scale-105'
                          : 'bg-white hover:bg-blue-50 border-gray-200 hover:border-blue-300 hover:shadow-md'
                          }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleGenreToggle(genre.id)}
                          className="w-5 h-5 rounded border-2 text-tur2-600 focus:ring-2 focus:ring-tur2-500 cursor-pointer"
                        />
                        <span className={`ml-3 font-semibold ${isSelected ? 'text-white' : 'text-gray-800'}`}>
                          {genre.name}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Formulario principal */}
            <div className="lg:col-span-3 space-y-6">

              {/* Nombre de usuario */}
              <div>
                <label htmlFor="userName" className="block text-lg font-bold text-gray-900 mb-2">
                  🏷️ Nombre de Usuario
                </label>
                <input
                  id="userName"
                  name="userName"
                  type="text"
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  value={formData.userName}
                  className={`w-full px-5 py-4 bg-gray-50 border-2 rounded-xl text-gray-900 text-lg placeholder-gray-400 focus:outline-none focus:ring-4 transition-all duration-300 ${touched.userName && errors.userName
                    ? 'border-red-500 focus:ring-red-200'
                    : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'
                    }`}
                  placeholder="Tu nombre de usuario"
                />
                {touched.userName && errors.userName && (
                  <p className="mt-2 text-sm text-red-600 font-medium">{errors.userName}</p>
                )}
              </div>

              {/* Nombre completo */}
              <div>
                <label htmlFor="name" className="block text-lg font-bold text-gray-900 mb-2">
                  👤 Nombre Completo
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  value={formData.name}
                  className={`w-full px-5 py-4 bg-gray-50 border-2 rounded-xl text-gray-900 text-lg placeholder-gray-400 focus:outline-none focus:ring-4 transition-all duration-300 ${touched.name && errors.name
                    ? 'border-red-500 focus:ring-red-200'
                    : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'
                    }`}
                  placeholder="Tu nombre completo"
                />
                {touched.name && errors.name && (
                  <p className="mt-2 text-sm text-red-600 font-medium">{errors.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-lg font-bold text-gray-900 mb-2">
                  📧 Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  disabled={true}
                  value={formData.email}
                  className="w-full px-5 py-4 bg-gray-200 border-2 border-gray-300 rounded-xl text-gray-500 text-lg cursor-not-allowed opacity-70" // <--- Estilos visuales de bloqueado
                  placeholder={user.email}
                />
                {/* Nota informativa opcional */}
                <p className="mt-1 text-xs text-gray-500">
                  El correo electrónico no se puede modificar.
                </p>
              </div>

              {/* Contraseña */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="password" className="block text-lg font-bold text-gray-900 mb-2">
                    🔒 Nueva Contraseña
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    value={formData.password}
                    className={`w-full px-5 py-4 bg-gray-50 border-2 rounded-xl text-gray-900 text-lg placeholder-gray-400 focus:outline-none focus:ring-4 transition-all duration-300 ${touched.password && errors.password
                      ? 'border-red-500 focus:ring-red-200'
                      : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'
                      }`}
                    placeholder="Dejar vacío para no cambiar"
                  />
                  {touched.password && errors.password && (
                    <p className="mt-2 text-xs text-red-600 font-medium">{errors.password}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-lg font-bold text-gray-900 mb-2">
                    🔒 Confirmar Contraseña
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    value={formData.confirmPassword}
                    className={`w-full px-5 py-4 bg-gray-50 border-2 rounded-xl text-gray-900 text-lg placeholder-gray-400 focus:outline-none focus:ring-4 transition-all duration-300 ${touched.confirmPassword && errors.confirmPassword
                      ? 'border-red-500 focus:ring-red-200'
                      : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'
                      }`}
                    placeholder="Confirma tu contraseña"
                  />
                  {touched.confirmPassword && errors.confirmPassword && (
                    <p className="mt-2 text-sm text-red-600 font-medium">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>

              {/* Sobre mí */}
              <div>
                <label htmlFor="aboutMe" className="block text-lg font-bold text-gray-900 mb-2">
                  📝 Sobre Mí
                </label>
                <textarea
                  id="aboutMe"
                  name="aboutMe"
                  rows={5}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  value={formData.aboutMe}
                  className={`w-full px-5 py-4 bg-gray-50 border-2 rounded-xl text-gray-900 text-lg placeholder-gray-400 focus:outline-none focus:ring-4 transition-all duration-300 resize-none ${touched.aboutMe && errors.aboutMe
                    ? 'border-red-500 focus:ring-red-200'
                    : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'
                    }`}
                  placeholder="Cuéntanos sobre ti, tus intereses musicales, experiencia..."
                />
                {touched.aboutMe && errors.aboutMe && (
                  <p className="mt-2 text-sm text-red-600 font-medium">{errors.aboutMe}</p>
                )}
              </div>

              {/* Ubicación */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="city" className="block text-lg font-bold text-gray-900 mb-2">
                    🏙️ Ciudad
                  </label>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    value={formData.city}
                    className={`w-full px-5 py-4 bg-gray-50 border-2 rounded-xl text-gray-900 text-lg placeholder-gray-400 focus:outline-none focus:ring-4 transition-all duration-300 ${touched.city && errors.city
                      ? 'border-red-500 focus:ring-red-200'
                      : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'
                      }`}
                    placeholder="Tu ciudad"
                  />
                  {touched.city && errors.city && (
                    <p className="mt-2 text-sm text-red-600 font-medium">{errors.city}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="country" className="block text-lg font-bold text-gray-900 mb-2">
                    🌍 País
                  </label>
                  <input
                    id="country"
                    name="country"
                    type="text"
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    value={formData.country}
                    className={`w-full px-5 py-4 bg-gray-50 border-2 rounded-xl text-gray-900 text-lg placeholder-gray-400 focus:outline-none focus:ring-4 transition-all duration-300 ${touched.country && errors.country
                      ? 'border-red-500 focus:ring-red-200'
                      : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'
                      }`}
                    placeholder="Tu país"
                  />
                  {touched.country && errors.country && (
                    <p className="mt-2 text-sm text-red-600 font-medium">{errors.country}</p>
                  )}
                </div>
              </div>

              {/* Dirección */}
              <div>
                <label htmlFor="address" className="block text-lg font-bold text-gray-900 mb-2">
                  📍 Dirección
                </label>
                <input
                  id="address"
                  name="address"
                  type="text"
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  value={formData.address}
                  className={`w-full px-5 py-4 bg-gray-50 border-2 rounded-xl text-gray-900 text-lg placeholder-gray-400 focus:outline-none focus:ring-4 transition-all duration-300 ${touched.address && errors.address
                    ? 'border-red-500 focus:ring-red-200'
                    : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'
                    }`}
                  placeholder="Tu dirección"
                />
                {touched.address && errors.address && (
                  <p className="mt-2 text-sm text-red-600 font-medium">{errors.address}</p>
                )}
              </div>

              {/* Botón Submit */}
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className={`w-full py-4 px-6 rounded-lg text-lg font-bold transition-all duration-300 transform ${submitting
                  ? 'bg-gray-400 cursor-not-allowed opacity-50'
                  : 'bg-gradient-to-r from-oscuro2 to-tur2 text-white cursor-pointer hover:from-tur2 hover:to-oscuro3 hover:shadow-xl hover:scale-105'
                  }`}
              >
                {submitting ? '💾 Guardando cambios...' : '✅ Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #23484d7a;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #23484d8c;
        }
      `}</style>
    </div>
  );
}