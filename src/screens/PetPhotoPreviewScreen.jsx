
import React, { useState } from 'react';

import {
  View,
  Text,
  Image,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

import { colors } from '../styles/colors';

export default function PetPhotoPreviewScreen({
  navigation,
  route,
  onUploadPetPhoto,
}) {
  const petId = route.params?.petId;
  const photoUri = route.params?.photoUri;

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function handleUpload() {
    if (!petId || !photoUri || uploading) {
      return;
    }

    setUploading(true);
    setError('');

    try {
      await onUploadPetPhoto(petId, photoUri);

      // Regresar al perfil y actualizar su información
      navigation.pop(2);
    } catch (uploadError) {
      setError(
        uploadError.message ||
        'No se pudo guardar la fotografía.'
      );
    } finally {
      setUploading(false);
    }
  }

  if (!photoUri) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.errorText}>
          No hay una fotografía para mostrar.
        </Text>

        <Pressable
          style={styles.primaryButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.primaryText}>
            Regresar
          </Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          Vista previa
        </Text>
      </View>

      <Image
        source={{ uri: photoUri }}
        style={styles.image}
        resizeMode="contain"
      />

      <View style={styles.actions}>
        <Text style={styles.infoText}>
          Revisa la fotografía antes de guardarla.
        </Text>

        {!!error && (
          <Text style={styles.errorText}>
            {error}
          </Text>
        )}

        <Pressable
          style={[
            styles.primaryButton,
            uploading && styles.disabled,
          ]}
          onPress={handleUpload}
          disabled={uploading}
          accessibilityRole="button"
        >
          {uploading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <>
              <Ionicons
                name="cloud-upload-outline"
                size={22}
                color={colors.white}
              />

              <Text style={styles.primaryText}>
                Guardar fotografía
              </Text>
            </>
          )}
        </Pressable>

        <Pressable
          style={styles.secondaryButton}
          onPress={() => navigation.goBack()}
          disabled={uploading}
          accessibilityRole="button"
        >
          <Ionicons
            name="camera-outline"
            size={21}
            color={colors.primaryDark}
          />

          <Text style={styles.secondaryText}>
            Tomar otra
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#101010',
  },
  center: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 18,
  },
  header: {
    paddingTop: 18,
    paddingBottom: 12,
    alignItems: 'center',
  },
  title: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
  image: {
    flex: 1,
    width: '100%',
  },
  actions: {
    paddingHorizontal: 22,
    paddingBottom: 24,
    paddingTop: 20,
    gap: 12,
  },
  infoText: {
    textAlign: 'center',
    fontSize: 13,
    color: colors.white,
    marginBottom: 6,
  },
  errorText: {
    color: '#FFB4B4',
    fontSize: 14,
    textAlign: 'center',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: colors.primary,
    borderRadius: 12,
    minHeight: 54,
  },
  primaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: colors.lightTeal,
    borderRadius: 12,
    minHeight: 54,
  },
  secondaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primaryDark,
  },
  disabled: {
    opacity: 0.6,
  },
});
