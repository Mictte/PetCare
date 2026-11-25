
import { Platform } from 'react-native';
import { File } from 'expo-file-system';
import { fetch as expoFetch } from 'expo/fetch';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export const MAX_PHOTO_SIZE = 5 * 1024 * 1024;

// Obtener la dirección de una fotografía del servidor
export function getPetPhotoUrl(photo) {
  if (!photo || typeof photo !== 'string') {
    return null;
  }

  if (/^https?:\/\//i.test(photo)) {
    return photo;
  }

  if (!BASE_URL) {
    return null;
  }

  return `${BASE_URL.replace(/\/$/, '')}/${photo.replace(/^\/+/, '')}`;
}

// Subir una fotografía al perfil de la mascota
export async function uploadPetPhoto(accessToken, petId, photoUri) {
  if (Platform.OS === 'web') {
    throw new Error(
      'La fotografía debe enviarse desde Expo Go.'
    );
  }

  if (!BASE_URL) {
    throw new Error('No se ha configurado la URL de PetCare_API');
  }

  if (!accessToken || !petId || !photoUri) {
    throw new Error('Faltan datos para enviar la fotografía');
  }

  const file = new File(photoUri);

  if (!file.exists) {
    throw new Error('No se encontró la fotografía guardada');
  }

  if (file.size === 0 || file.size > MAX_PHOTO_SIZE) {
    throw new Error(
      'La fotografía debe ser válida y no superar los 5 MB'
    );
  }

  const formData = new FormData();

  // Enviar el archivo con el nombre del campo de Django
  formData.append('photo', file);

  let response;

  try {
    response = await expoFetch(
      `${BASE_URL.replace(/\/$/, '')}/api/pets/${petId}/`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      }
    );
  } catch {
    throw new Error('No se pudo conectar con PetCare_API');
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    let message = 'No se pudo subir la fotografía';

    if (response.status === 401) {
      message = 'La sesión expiró';
    } else if (typeof data?.detail === 'string') {
      message = data.detail;
    } else if (Array.isArray(data?.photo)) {
      message = data.photo[0];
    } else if (typeof data?.photo === 'string') {
      message = data.photo;
    }

    const error = new Error(message);
    error.status = response.status;

    throw error;
  }

  return data;
}
