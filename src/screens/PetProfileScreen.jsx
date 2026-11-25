
import React, { useCallback, useState } from 'react';

import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { colors } from '../styles/colors';
import { getPetPhotoUrl } from '../services/petPhotoService';

function getSpeciesName(species) {
  if (species?.toLowerCase() === 'dog') return 'Perro';
  if (species?.toLowerCase() === 'cat') return 'Gato';

  return species || 'No registrado';
}

function getSexName(sex) {
  if (sex === 'female') return 'Hembra';
  if (sex === 'male') return 'Macho';

  return 'No registrado';
}

function formatDate(value) {
  if (!value) return 'No registrada';

  const parts = value.split('-');

  if (parts.length !== 3) return value;

  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function displayValue(value) {
  if (value === null || value === undefined || value === '') {
    return 'No registrado';
  }

  return String(value);
}

function DetailField({ icon, label, value }) {
  return (
    <View style={styles.detailBox}>
      <View style={styles.detailLabelRow}>
        <Ionicons
          name={icon}
          size={17}
          color={colors.primary}
        />

        <Text style={styles.detailLabel}>
          {label}
        </Text>
      </View>

      <Text style={styles.detailValue}>
        {displayValue(value)}
      </Text>
    </View>
  );
}

function InfoField({ icon, label, value }) {
  return (
    <View style={styles.infoCard}>
      <Ionicons
        name={icon}
        size={21}
        color={colors.primary}
      />

      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>
          {label}
        </Text>

        <Text style={styles.infoText}>
          {displayValue(value)}
        </Text>
      </View>
    </View>
  );
}

export default function PetProfileScreen({
  navigation,
  route,
  onGetPet,
}) {
  const petId = route.params?.petId;

  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  // Actualizar los datos al regresar al perfil
  useFocusEffect(
    useCallback(() => {
      let active = true;

      setLoading(true);
      setError('');

      async function loadPet() {
        try {
          const data = await onGetPet(petId);

          if (active) {
            setPet(data);
          }
        } catch (err) {
          if (active) {
            setError(err.message);
          }
        } finally {
          if (active) {
            setLoading(false);
          }
        }
      }

      loadPet();

      return () => {
        active = false;
      };
    }, [petId, onGetPet, retryCount])
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator
            size="large"
            color={colors.primary}
          />

          <Text style={styles.message}>
            Cargando información...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !pet) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Ionicons
            name="alert-circle-outline"
            size={43}
            color={colors.error}
          />

          <Text style={styles.errorText}>
            {error || 'No se encontró la mascota'}
          </Text>

          <Pressable
            style={styles.retryButton}
            onPress={() => setRetryCount(value => value + 1)}
          >
            <Text style={styles.retryText}>
              Reintentar
            </Text>
          </Pressable>

          <Pressable onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>
              Regresar a Mis mascotas
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const photoUrl = getPetPhotoUrl(pet.photo);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Regresar a Mis mascotas"
          >
            <Ionicons
              name="chevron-back"
              size={25}
              color={colors.text}
            />
          </Pressable>

          <Text style={styles.headerTitle}>
            Detalle de mascota
          </Text>

          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.petCard}>
          <View style={styles.avatar}>
            {photoUrl ? (
              <Image
                source={{ uri: photoUrl }}
                style={styles.petPhoto}
                resizeMode="cover"
              />
            ) : (
              <Ionicons
                name="paw"
                size={43}
                color={colors.primary}
              />
            )}
          </View>

          <View style={styles.petInfo}>
            <Text style={styles.petName}>
              {pet.name}
            </Text>

            <Text style={styles.petBreed}>
              {pet.breed || getSpeciesName(pet.species)}
            </Text>

            <View style={styles.petTag}>
              <Text style={styles.petTagText}>
                {getSexName(pet.sex)}
              </Text>
            </View>
          </View>
        </View>

        <Pressable
          style={styles.photoButton}
          onPress={() =>
            navigation.navigate('PetCamera', {
              petId: pet.id,
            })
          }
          accessibilityRole="button"
        >
          <Ionicons
            name="camera-outline"
            size={21}
            color={colors.primaryDark}
          />

          <Text style={styles.photoButtonText}>
            {photoUrl
              ? 'Cambiar fotografía'
              : 'Tomar fotografía'}
          </Text>
        </Pressable>

        <Text style={styles.sectionTitle}>
          Información general
        </Text>

        <View style={styles.detailsRow}>
          <DetailField
            icon="paw-outline"
            label="Especie"
            value={getSpeciesName(pet.species)}
          />

          <DetailField
            icon="information-circle-outline"
            label="Raza"
            value={pet.breed}
          />
        </View>

        <View style={styles.detailsRow}>
          <DetailField
            icon="male-female-outline"
            label="Sexo"
            value={getSexName(pet.sex)}
          />

          <DetailField
            icon="calendar-outline"
            label="Nacimiento"
            value={formatDate(pet.birth_date)}
          />
        </View>

        <View style={styles.detailsRow}>
          <DetailField
            icon="scale-outline"
            label="Peso"
            value={pet.weight ? `${pet.weight} kg` : null}
          />

          <DetailField
            icon="color-palette-outline"
            label="Color"
            value={pet.color}
          />
        </View>

        <Text style={styles.sectionTitle}>
          Identificación
        </Text>

        <InfoField
          icon="finger-print-outline"
          label="Señas particulares"
          value={pet.distinctive_marks}
        />

        <Text style={styles.sectionTitle}>
          Información importante
        </Text>

        <InfoField
          icon="alert-circle-outline"
          label="Alergias"
          value={pet.allergies}
        />

        <InfoField
          icon="medkit-outline"
          label="Condiciones importantes"
          value={pet.medical_conditions}
        />

        <InfoField
          icon="medical-outline"
          label="Medicamentos actuales"
          value={pet.current_medications}
        />

        <Text style={styles.sectionTitle}>
          Observaciones
        </Text>

        <InfoField
          icon="document-text-outline"
          label="Observaciones generales"
          value={pet.observations}
        />

        <Pressable
          style={styles.editButton}
          onPress={() =>
            navigation.navigate('PetForm', {
              petId: pet.id,
            })
          }
          accessibilityRole="button"
        >
          <Ionicons
            name="create-outline"
            size={21}
            color={colors.white}
          />

          <Text style={styles.editButtonText}>
            Editar información
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 35,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  message: {
    color: colors.secondaryText,
    marginTop: 15,
  },
  errorText: {
    color: colors.error,
    textAlign: 'center',
    marginVertical: 17,
  },
  retryButton: {
    backgroundColor: colors.lightTeal,
    paddingHorizontal: 26,
    paddingVertical: 13,
    borderRadius: 10,
  },
  retryText: {
    color: colors.primaryDark,
    fontWeight: '600',
  },
  backText: {
    color: colors.primary,
    fontWeight: '600',
    marginTop: 22,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  backButton: {
    width: 38,
    height: 38,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  headerSpacer: {
    width: 38,
  },
  petCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    backgroundColor: colors.primary,
    borderRadius: 17,
    padding: 20,
    marginBottom: 18,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  petPhoto: {
    width: 84,
    height: 84,
    borderRadius: 42,
  },
  petInfo: {
    flex: 1,
    gap: 5,
  },
  petName: {
    fontSize: 25,
    fontWeight: 'bold',
    color: colors.white,
  },
  petBreed: {
    fontSize: 14,
    color: colors.white,
  },
  petTag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginTop: 4,
  },
  petTagText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.lightTeal,
    borderRadius: 10,
    minHeight: 48,
    marginBottom: 24,
  },
  photoButtonText: {
    color: colors.primaryDark,
    fontSize: 14,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 10,
    marginBottom: 14,
  },
  detailsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  detailBox: {
    flex: 1,
    minHeight: 92,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 13,
    gap: 10,
  },
  detailLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailLabel: {
    fontSize: 12,
    color: colors.secondaryText,
    flexShrink: 1,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: colors.lightTeal,
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
  },
  infoContent: {
    flex: 1,
    gap: 5,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primaryDark,
  },
  infoText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  editButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    marginTop: 20,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
});
