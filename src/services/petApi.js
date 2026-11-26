
const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

async function request(endpoint, options = {}) {
  if (!BASE_URL) {
    throw new Error('No se ha configurado la URL de PetCare_API');
  }

  let response;

  try {
    response = await fetch(
      `${BASE_URL.replace(/\/$/, '')}${endpoint}`,
      {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      }
    );
  } catch {
    throw new Error('No se pudo conectar con PetCare_API');
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    let message = 'Ocurrió un error en el servidor';

    if (response.status === 401) {
      message = 'Credenciales incorrectas o sesión expirada';
    } else if (response.status === 404) {
      message = 'No se encontró el recurso solicitado';
    } else if (typeof data?.detail === 'string') {
      message = data.detail;
    } else if (data && typeof data === 'object') {
      const field = Object.keys(data)[0];
      const firstError = data[field];
      const description = Array.isArray(firstError)
        ? firstError[0]
        : firstError;

      if (typeof description === 'string') {
        message = `${field}: ${description}`;
      }
    }

    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return data;
}

// Registrar usuario
export function registerUser(userData) {
  return request('/api/users/register/', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
}

// Iniciar sesión
export async function loginUser(username, password) {
  const data = await request('/api/token/', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });

  if (
    typeof data?.access !== 'string' ||
    typeof data?.refresh !== 'string'
  ) {
    throw new Error('El servidor no devolvió los tokens esperados');
  }

  return {
    access: data.access,
    refresh: data.refresh,
  };
}

// Renovar token JWT
export function refreshAccessToken(refresh) {
  return request('/api/token/refresh/', {
    method: 'POST',
    body: JSON.stringify({ refresh }),
  });
}

// Verificar token JWT
export function verifyToken(token) {
  return request('/api/token/verify/', {
    method: 'POST',
    body: JSON.stringify({ token }),
  });
}

// Consultar mascotas
export function getPets(accessToken) {
  return request('/api/pets/', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

// Registrar mascota
export function createPet(accessToken, petData) {
  return request('/api/pets/', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(petData),
  });
}

// Consultar mascota por UUID
export function getPetById(accessToken, petId) {
  return request(`/api/pets/${petId}/`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

// Editar información de mascota
export function updatePet(accessToken, petId, petData) {
  return request(`/api/pets/${petId}/`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(petData),
  });
}

// Obtener el identificador del carnet digital
export function getPetCardToken(accessToken, petId) {
  return request(`/api/pets/${petId}/carnet/`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}


// Autorizar o desautorizar el contacto del propietario
export function updateCardAccess(accessToken, petId, shareContact) {
  return request(`/api/pets/${petId}/carnet/`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      share_contact: shareContact,
    }),
  });
}

// Invalidar el código QR y generar otro
export function renewPetCard(accessToken, petId) {
  return request(`/api/pets/${petId}/renovar-carnet/`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

// Consultar información autorizada mediante el QR
export function getVeterinaryPet(cardToken) {
  return request(`/api/carnets/${cardToken}/`, {
    method: 'GET',
  });
}
