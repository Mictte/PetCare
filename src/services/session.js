
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const SESSION_KEY = 'petcare_jwt_session';
const OLD_TOKEN_KEY = 'petcare_auth_token';

async function getValue(key) {
  if (Platform.OS === 'web') {
    return AsyncStorage.getItem(key);
  }

  return SecureStore.getItemAsync(key);
}

async function setValue(key, value) {
  if (Platform.OS === 'web') {
    return AsyncStorage.setItem(key, value);
  }

  return SecureStore.setItemAsync(key, value);
}

async function removeValue(key) {
  if (Platform.OS === 'web') {
    return AsyncStorage.removeItem(key);
  }

  return SecureStore.deleteItemAsync(key);
}

// Guardar los tokens de PetCare_API
export async function saveSession(tokens) {
  if (
    typeof tokens?.access !== 'string' ||
    typeof tokens?.refresh !== 'string'
  ) {
    throw new Error('Los tokens de sesión no son válidos');
  }

  await setValue(SESSION_KEY, JSON.stringify(tokens));
}

// Recuperar la sesión guardada
export async function readSession() {
  // Eliminar el token de la integración anterior
  await removeValue(OLD_TOKEN_KEY);

  const storedSession = await getValue(SESSION_KEY);

  if (!storedSession) {
    return null;
  }

  try {
    const tokens = JSON.parse(storedSession);

    if (
      typeof tokens.access !== 'string' ||
      typeof tokens.refresh !== 'string'
    ) {
      throw new Error('Sesión inválida');
    }

    return tokens;
  } catch {
    await removeValue(SESSION_KEY);
    return null;
  }
}

// Cerrar sesión y borrar los tokens
export async function clearSession() {
  await removeValue(SESSION_KEY);
  await removeValue(OLD_TOKEN_KEY);
}
