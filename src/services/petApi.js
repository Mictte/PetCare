
const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

async function request(endpoint, options = {}) {
  if (!BASE_URL) {
    throw new Error('No se ha configurado la URL de la API');
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
    throw new Error('No se pudo conectar con el servidor');
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    let message = 'Ocurrió un error en el servidor';

    if (response.status === 401) {
      message = 'Credenciales incorrectas o sesión expirada';
    } else if (response.status === 404) {
      message = 'No se encontró el recurso solicitado';
    } else if (data?.detail) {
      message = data.detail;
    } else if (data && typeof data === 'object') {
      const firstError = Object.values(data)[0];

      if (Array.isArray(firstError)) {
        message = String(firstError[0]);
      } else if (typeof firstError === 'string') {
        message = firstError;
      }
    }

    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return data;
}

// Crear una cuenta
export function registerUser(userData) {
  return request('/api/auth/signup/', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
}

// Iniciar sesion
export async function loginUser(email, password) {
  const data = await request('/api/auth/login/', {
    method: 'POST',
    body: JSON.stringify({
      email,
      password,
    }),
  });

  if (typeof data?.token !== 'string' || !data.token) {
    throw new Error('El servidor no devolvió un token válido');
  }

  return data.token;
}

// Consultar el perfil del usuario autenticado
export function getProfile(token) {
  return request('/api/auth/get-profile/', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
