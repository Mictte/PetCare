
import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import LoginScreen from './src/screens/LoginScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import PetListScreen from './src/screens/PetListScreen';
import PetFormScreen from './src/screens/PetFormScreen';
import PetProfileScreen from './src/screens/PetProfileScreen';
import PetCameraScreen from './src/screens/PetCameraScreen';
import PetPhotoPreviewScreen from './src/screens/PetPhotoPreviewScreen';
import PetCardScreen from './src/screens/PetCardScreen';

import {
  loginUser,
  registerUser,
  refreshAccessToken,
  getPets,
  createPet,
  getPetById,
  updatePet,
  getPetCardToken,
} from './src/services/petApi';

import {
  saveSession,
  readSession,
  clearSession,
} from './src/services/session';

import { uploadPetPhoto } from './src/services/petPhotoService';
import { colors } from './src/styles/colors';

const Stack = createNativeStackNavigator();

export default function App() {
  const [session, setSession] = useState(null);
  const [restoring, setRestoring] = useState(true);
  const [restoreError, setRestoreError] = useState('');

  const restoreSession = useCallback(async () => {
    setRestoring(true);
    setRestoreError('');

    try {
      const savedSession = await readSession();

      if (!savedSession) {
        setSession(null);
        return;
      }

      const renewed = await refreshAccessToken(
        savedSession.refresh
      );

      if (typeof renewed?.access !== 'string') {
        throw new Error('No se pudo renovar la sesión');
      }

      const updatedSession = {
        access: renewed.access,
        refresh: renewed.refresh || savedSession.refresh,
      };

      await saveSession(updatedSession);
      setSession(updatedSession);
    } catch (error) {
      if (error.status === 401 || error.status === 400) {
        try {
          await clearSession();
          setSession(null);
        } catch {
          setRestoreError('No se pudo borrar la sesión anterior.');
        }
      } else {
        setRestoreError(
          'No se pudo restaurar la sesión. Revisa tu conexión.'
        );
      }
    } finally {
      setRestoring(false);
    }
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  // Iniciar sesión
  async function handleLogin({ username, password }) {
    const tokens = await loginUser(username, password);

    await saveSession(tokens);
    setSession(tokens);
    setRestoreError('');
  }

  // Registrar usuario
  async function handleSignUp(userData) {
    return registerUser(userData);
  }

  // Cerrar sesión
  async function handleLogout() {
    try {
      await clearSession();
      setSession(null);
      setRestoreError('');
    } catch {
      setRestoreError('No se pudo cerrar la sesión.');
    }
  }

  // Ejecutar peticiones con JWT y renovar access
  const runAuthorized = useCallback(async (action) => {
    if (!session) {
      throw new Error('Debes iniciar sesión');
    }

    try {
      return await action(session.access);
    } catch (error) {
      if (error.status !== 401) {
        throw error;
      }

      let renewed;

      try {
        renewed = await refreshAccessToken(
          session.refresh
        );
      } catch (refreshError) {
        if (
          refreshError.status === 401 ||
          refreshError.status === 400
        ) {
          await clearSession();
          setSession(null);

          throw new Error(
            'Tu sesión expiró. Inicia sesión nuevamente.'
          );
        }

        throw refreshError;
      }

      if (typeof renewed?.access !== 'string') {
        throw new Error('No se pudo renovar la sesión');
      }

      const updatedSession = {
        access: renewed.access,
        refresh: renewed.refresh || session.refresh,
      };

      await saveSession(updatedSession);
      setSession(updatedSession);

      return action(updatedSession.access);
    }
  }, [session]);

  // Consultar lista de mascotas
  const handleGetPets = useCallback(() => {
    return runAuthorized(
      (access) => getPets(access)
    );
  }, [runAuthorized]);

  // Registrar mascota
  const handleCreatePet = useCallback((petData) => {
    return runAuthorized(
      (access) => createPet(access, petData)
    );
  }, [runAuthorized]);

  // Consultar mascota por UUID
  const handleGetPet = useCallback((petId) => {
    return runAuthorized(
      (access) => getPetById(access, petId)
    );
  }, [runAuthorized]);

  // Editar mascota
  const handleUpdatePet = useCallback((petId, petData) => {
    return runAuthorized(
      (access) => updatePet(access, petId, petData)
    );
  }, [runAuthorized]);

  // Guardar fotografía
  const handleUploadPetPhoto = useCallback(
    (petId, photoUri) => {
      return runAuthorized(
        (access) => uploadPetPhoto(access, petId, photoUri)
      );
    },
    [runAuthorized]
  );

  // Obtener identificador del carnet digital
  const handleGetCardToken = useCallback((petId) => {
    return runAuthorized(
      (access) => getPetCardToken(access, petId)
    );
  }, [runAuthorized]);

  if (restoring) {
    return (
      <SafeAreaProvider>
        <View style={styles.center}>
          <ActivityIndicator
            size="large"
            color={colors.primary}
          />

          <Text style={styles.message}>
            Verificando sesión...
          </Text>
        </View>
      </SafeAreaProvider>
    );
  }

  if (restoreError) {
    return (
      <SafeAreaProvider>
        <View style={styles.center}>
          <Text style={styles.message}>
            {restoreError}
          </Text>

          <Pressable
            style={styles.button}
            onPress={restoreSession}
          >
            <Text style={styles.buttonText}>
              Reintentar
            </Text>
          </Pressable>

          <Pressable onPress={handleLogout}>
            <Text style={styles.linkText}>
              Cerrar sesión
            </Text>
          </Pressable>
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{ headerShown: false }}
        >
          {session ? (
            <>
              <Stack.Screen name="PetList">
                {(props) => (
                  <PetListScreen
                    {...props}
                    onGetPets={handleGetPets}
                    onSignOut={handleLogout}
                  />
                )}
              </Stack.Screen>

              <Stack.Screen name="PetProfile">
                {(props) => (
                  <PetProfileScreen
                    {...props}
                    onGetPet={handleGetPet}
                  />
                )}
              </Stack.Screen>

              <Stack.Screen name="PetForm">
                {(props) => (
                  <PetFormScreen
                    {...props}
                    onCreatePet={handleCreatePet}
                    onGetPet={handleGetPet}
                    onUpdatePet={handleUpdatePet}
                  />
                )}
              </Stack.Screen>

              <Stack.Screen name="PetCamera">
                {(props) => (
                  <PetCameraScreen {...props} />
                )}
              </Stack.Screen>

              <Stack.Screen name="PetPhotoPreview">
                {(props) => (
                  <PetPhotoPreviewScreen
                    {...props}
                    onUploadPetPhoto={handleUploadPetPhoto}
                  />
                )}
              </Stack.Screen>

              <Stack.Screen name="PetCard">
                {(props) => (
                  <PetCardScreen
                    {...props}
                    onGetPet={handleGetPet}
                    onGetCardToken={handleGetCardToken}
                  />
                )}
              </Stack.Screen>
            </>
          ) : (
            <>
              <Stack.Screen name="Login">
                {(props) => (
                  <LoginScreen
                    {...props}
                    onLogin={handleLogin}
                  />
                )}
              </Stack.Screen>

              <Stack.Screen name="SignUp">
                {(props) => (
                  <SignUpScreen
                    {...props}
                    onSignUp={handleSignUp}
                  />
                )}
              </Stack.Screen>
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: colors.background,
  },
  message: {
    fontSize: 15,
    color: colors.text,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 10,
    marginBottom: 18,
  },
  buttonText: {
    color: colors.white,
    fontWeight: '600',
  },
  linkText: {
    color: colors.primary,
    fontWeight: '600',
    padding: 8,
  },
});
