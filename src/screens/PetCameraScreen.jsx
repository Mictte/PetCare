
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  Alert,
  AppState,
  Linking,
  Platform,
  StyleSheet,
} from 'react-native';

import { CameraView, useCameraPermissions } from 'expo-camera';
import { File, Paths } from 'expo-file-system';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { colors } from '../styles/colors';
import { MAX_PHOTO_SIZE } from '../services/petPhotoService';

export default function PetCameraScreen({
  navigation,
  route,
}) {
  const petId = route.params?.petId;

  const [facing, setFacing] = useState('back');
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [cameraFocused, setCameraFocused] = useState(false);
  const [cameraError, setCameraError] = useState('');

  const [permission, requestPermission, getPermission] =
    useCameraPermissions();

  const cameraRef = useRef(null);

  // Revisar el permiso al regresar de Ajustes
  useEffect(() => {
    if (Platform.OS === 'web') return;

    const subscription = AppState.addEventListener(
      'change',
      (state) => {
        if (state === 'active') {
          getPermission();
        }
      }
    );

    return () => subscription.remove();
  }, [getPermission]);

  // Activar la cámara solamente en esta pantalla
  useFocusEffect(
    useCallback(() => {
      setCameraFocused(true);

      return () => {
        setCameraFocused(false);
        setReady(false);
      };
    }, [])
  );

  function toggleFacing() {
    setReady(false);

    setFacing((current) =>
      current === 'back' ? 'front' : 'back'
    );
  }

  // Tomar fotografía y conservar una copia local
  async function takePhoto() {
    if (!ready || busy || !cameraRef.current || !petId) {
      return;
    }

    setBusy(true);
    setCameraError('');

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.65,
      });

      if (!photo?.uri) {
        throw new Error('No se pudo capturar la fotografía');
      }

      const source = new File(photo.uri);

      if (!source.exists) {
        throw new Error('No se encontró la fotografía temporal');
      }

      if (source.size === 0 || source.size > MAX_PHOTO_SIZE) {
        throw new Error(
          'La fotografía supera los 5 MB. Intenta tomar otra.'
        );
      }

      const savedPhoto = new File(
        Paths.document,
        `pet-${petId}-${Date.now()}.jpg`
      );

      await source.copy(savedPhoto);

      if (!savedPhoto.exists) {
        throw new Error('No se pudo guardar la fotografía');
      }

      // React Navigation conserva la URI sin codificarla
      navigation.navigate('PetPhotoPreview', {
        petId,
        photoUri: savedPhoto.uri,
      });
    } catch (error) {
      Alert.alert(
        'Error al tomar la foto',
        error.message || 'Intenta nuevamente.'
      );
    } finally {
      setBusy(false);
    }
  }

  if (Platform.OS === 'web') {
    return (
      <View style={styles.center}>
        <Text style={styles.message}>
          Para tomar fotografías, abre PetCare desde
          Expo Go en tu teléfono.
        </Text>

        <Pressable
          style={styles.button}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>
            Regresar
          </Text>
        </Pressable>
      </View>
    );
  }

  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color={colors.primary}
        />

        <Text style={styles.message}>
          Comprobando permiso de cámara...
        </Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Ionicons
          name="camera-outline"
          size={54}
          color={colors.primary}
        />

        <Text style={styles.message}>
          PetCare necesita permiso para tomar fotografías
          de tus mascotas.
        </Text>

        {permission.canAskAgain && (
          <Pressable
            style={styles.button}
            onPress={requestPermission}
          >
            <Text style={styles.buttonText}>
              Dar permiso
            </Text>
          </Pressable>
        )}

        <Pressable
          style={styles.secondaryButton}
          onPress={() => Linking.openSettings()}
        >
          <Text style={styles.secondaryText}>
            Abrir ajustes
          </Text>
        </Pressable>

        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>
            Volver al perfil
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {cameraFocused && (
        <CameraView
          key={facing}
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing={facing}
          onCameraReady={() => setReady(true)}
          onMountError={(event) => {
            setCameraError(
              event.message || 'No se pudo iniciar la cámara'
            );
          }}
        />
      )}

      <Pressable
        style={styles.backButton}
        onPress={() => navigation.goBack()}
        disabled={busy}
      >
        <Ionicons
          name="arrow-back"
          size={23}
          color={colors.white}
        />
        <Text style={styles.backButtonText}>
          Volver
        </Text>
      </Pressable>

      {!!cameraError && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>
            {cameraError}
          </Text>
        </View>
      )}

      <View style={styles.controls}>
        <View style={styles.side} />

        <Pressable
          style={[
            styles.shutter,
            (!ready || busy) && styles.disabled,
          ]}
          onPress={takePhoto}
          disabled={!ready || busy}
          accessibilityRole="button"
          accessibilityLabel="Tomar fotografía"
        >
          {busy ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <View style={styles.shutterInner} />
          )}
        </Pressable>

        <View style={styles.side}>
          <Pressable
            style={styles.flipButton}
            onPress={toggleFacing}
            disabled={busy}
            accessibilityRole="button"
            accessibilityLabel="Cambiar cámara"
          >
            <Ionicons
              name="camera-reverse-outline"
              size={26}
              color={colors.white}
            />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  center: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 26,
    gap: 18,
  },
  message: {
    fontSize: 15,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 23,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 28,
    paddingVertical: 15,
  },
  buttonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: colors.lightTeal,
    borderRadius: 10,
    paddingHorizontal: 25,
    paddingVertical: 14,
  },
  secondaryText: {
    color: colors.primaryDark,
    fontWeight: '600',
  },
  backText: {
    color: colors.primary,
    fontWeight: '600',
    padding: 10,
  },
  backButton: {
    position: 'absolute',
    top: 55,
    left: 22,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButtonText: {
    color: colors.white,
    fontWeight: '600',
  },
  errorBox: {
    position: 'absolute',
    top: 120,
    left: 22,
    right: 22,
    backgroundColor: 'rgba(0,0,0,0.75)',
    padding: 15,
    borderRadius: 10,
  },
  errorText: {
    color: '#FFB4B4',
    textAlign: 'center',
  },
  controls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 48,
  },
  side: {
    flex: 1,
    alignItems: 'flex-end',
  },
  shutter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.white,
  },
  flipButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 28,
    padding: 13,
  },
  disabled: {
    opacity: 0.5,
  },
});
