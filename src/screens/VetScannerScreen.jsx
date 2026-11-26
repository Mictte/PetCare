
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
  AppState,
  Linking,
  Platform,
  StyleSheet,
} from 'react-native';

import {
  CameraView,
  useCameraPermissions,
} from 'expo-camera';

import {
  useFocusEffect,
  useIsFocused,
} from '@react-navigation/native';

import Ionicons from '@expo/vector-icons/Ionicons';

import { colors } from '../styles/colors';

const QR_PATTERN =
  /^PETCARE:1:([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i;

export default function VetScannerScreen({
  navigation,
}) {
  const isFocused = useIsFocused();
  const scannedRef = useRef(false);

  const [scanError, setScanError] = useState('');

  const [
    permission,
    requestPermission,
    getPermission,
  ] = useCameraPermissions();

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

  useFocusEffect(
    useCallback(() => {
      scannedRef.current = false;
      setScanError('');

      return () => {
        scannedRef.current = true;
      };
    }, [])
  );

  function handleScan(result) {
    if (scannedRef.current) return;

    const qrText = String(result?.data || '').trim();
    const match = qrText.match(QR_PATTERN);

    if (!match) {
      setScanError(
        'El código escaneado no pertenece a PetCare.'
      );
      return;
    }

    scannedRef.current = true;

    navigation.navigate('VetPetInfo', {
      cardToken: match[1].toLowerCase(),
    });
  }

  if (Platform.OS === 'web') {
    return (
      <View style={styles.center}>
        <Text style={styles.message}>
          Abre PetCare desde Expo Go para escanear
          el código QR con la cámara del teléfono.
        </Text>

        <Pressable
          style={styles.button}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Regresar</Text>
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
          size={52}
          color={colors.primary}
        />

        <Text style={styles.message}>
          PetCare necesita acceso a la cámara
          para escanear los carnets digitales.
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
          <Text style={styles.returnText}>
            Regresar
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isFocused && (
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
          onBarcodeScanned={
            scannedRef.current ? undefined : handleScan
          }
        />
      )}

      <View style={styles.overlay}>
        <Pressable
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
        >
          <Ionicons
            name="arrow-back"
            size={23}
            color={colors.white}
          />
          <Text style={styles.backText}>Volver</Text>
        </Pressable>

        <View style={styles.scanArea}>
          <Text style={styles.title}>
            Escanear carnet digital
          </Text>

          <Text style={styles.description}>
            Coloca el código QR dentro del recuadro.
          </Text>

          <View style={styles.scanFrame}>
            <Ionicons
              name="scan-outline"
              size={120}
              color={colors.white}
            />
          </View>

          {!!scanError && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>
                {scanError}
              </Text>
            </View>
          )}
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
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 55,
    paddingBottom: 80,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    alignSelf: 'flex-start',
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 24,
  },
  backText: {
    color: colors.white,
    fontWeight: '600',
  },
  scanArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 18,
  },
  title: {
    color: colors.white,
    fontSize: 23,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  description: {
    color: colors.white,
    fontSize: 14,
    textAlign: 'center',
  },
  scanFrame: {
    width: 255,
    height: 255,
    borderWidth: 3,
    borderColor: colors.white,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.12)',
  },
  errorBox: {
    backgroundColor: 'rgba(0,0,0,0.72)',
    borderRadius: 10,
    padding: 13,
  },
  errorText: {
    color: '#FFB4B4',
    textAlign: 'center',
    fontWeight: '600',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 26,
    gap: 18,
  },
  message: {
    color: colors.text,
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 23,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 25,
    paddingVertical: 15,
  },
  buttonText: {
    color: colors.white,
    fontWeight: '600',
  },
  secondaryButton: {
    padding: 15,
    backgroundColor: colors.lightTeal,
    borderRadius: 10,
  },
  secondaryText: {
    color: colors.primaryDark,
    fontWeight: '600',
  },
  returnText: {
    color: colors.primary,
    fontWeight: '600',
    padding: 10,
  },
});
