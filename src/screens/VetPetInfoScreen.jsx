
import React, {
  useCallback,
  useState,
} from 'react';

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

function displayValue(value) {
  if (
    value === null ||
    value === undefined ||
    String(value).trim() === ''
  ) {
    return 'No registrado';
  }

  return String(value);
}

function getSpeciesName(species) {
  if (species?.toLowerCase() === 'dog') return 'Perro';
  if (species?.toLowerCase() === 'cat') return 'Gato';

  return displayValue(species);
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

function Detail({ label, value }) {
  return (
    <View style={styles.detailCard}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>
        {displayValue(value)}
      </Text>
    </View>
  );
}

function ImportantInfo({ label, value }) {
  return (
    <View style={styles.infoCard}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>
        {displayValue(value)}
      </Text>
    </View>
  );
}

export default function VetPetInfoScreen({
  navigation,
  route,
  onGetVeterinaryPet,
}) {
  const cardToken = route.params?.cardToken;

  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [photoFailed, setPhotoFailed] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      setLoading(true);
      setError('');
      setPet(null);
      setPhotoFailed(false);

      async function loadPet() {
        try {
          if (!cardToken) {
            throw new Error('El código QR no es válido.');
          }

          const data = await onGetVeterinaryPet(cardToken);

          if (active) {
            setPet(data);
          }
        } catch (err) {
          if (!active) return;

          if (err.status === 404) {
            setError(
              'El carnet no existe, fue renovado o ya no está disponible.'
            );
          } else if (err.status === 429) {
            setError(
              'Se realizaron demasiadas consultas. Intenta más tarde.'
            );
          } else {
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
    }, [cardToken, onGetVeterinaryPet, retryCount])
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
            Consultando información...
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
            size={45}
            color={colors.error}
          />

          <Text style={styles.errorText}>
            {error || 'No se encontró información de la mascota.'}
          </Text>

          <Pressable
            style={styles.button}
            onPress={() => setRetryCount(value => value + 1)}
          >
            <Text style={styles.buttonText}>
              Reintentar
            </Text>
          </Pressable>

          <Pressable onPress={() => navigation.goBack()}>
            <Text style={styles.backLink}>
              Escanear otro código
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const photoUrl = getPetPhotoUrl(pet.photo);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Pressable
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
          >
            <Ionicons
              name="chevron-back"
              size={26}
              color={colors.text}
            />
          </Pressable>

          <Text style={styles.headerTitle}>
            Información de mascota
          </Text>

          <View style={styles.headerSpace} />
        </View>

        <View style={styles.petCard}>
          <View style={styles.avatar}>
            {photoUrl && !photoFailed ? (
              <Image
                source={{ uri: photoUrl }}
                style={styles.photo}
                onError={() => setPhotoFailed(true)}
              />
            ) : (
              <Ionicons
                name="paw"
                size={41}
                color={colors.primary}
              />
            )}
          </View>

          <View style={styles.petHeaderInfo}>
            <Text style={styles.petName}>{pet.name}</Text>
            <Text style={styles.petSubtext}>
              {getSpeciesName(pet.species)}
              {pet.breed ? ` · ${pet.breed}` : ''}
            </Text>
            <Text style={styles.petSubtext}>
              {getSexName(pet.sex)}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>
          Identificación
        </Text>

        <View style={styles.row}>
          <Detail
            label="Nacimiento"
            value={formatDate(pet.birth_date)}
          />
          <Detail
            label="Peso"
            value={pet.weight ? `${pet.weight} kg` : null}
          />
        </View>

        <View style={styles.row}>
          <Detail label="Color" value={pet.color} />
          <Detail
            label="Sexo"
            value={getSexName(pet.sex)}
          />
        </View>

        <ImportantInfo
          label="Señas particulares"
          value={pet.distinctive_marks}
        />

        <Text style={styles.sectionTitle}>
          Información importante
        </Text>

        <ImportantInfo
          label="Alergias"
          value={pet.allergies}
        />

        <ImportantInfo
          label="Condiciones médicas"
          value={pet.medical_conditions}
        />

        <ImportantInfo
          label="Medicamentos actuales"
          value={pet.current_medications}
        />

        <ImportantInfo
          label="Observaciones"
          value={pet.observations}
        />

        <Text style={styles.sectionTitle}>
          Contacto del propietario
        </Text>

        {pet.owner_name && pet.owner_phone ? (
          <>
            <ImportantInfo
              label="Nombre"
              value={pet.owner_name}
            />
            <ImportantInfo
              label="Teléfono"
              value={pet.owner_phone}
            />
          </>
        ) : (
          <Text style={styles.privateText}>
            El propietario no ha autorizado compartir
            su información de contacto.
          </Text>
        )}

        <Pressable
          style={styles.button}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
        >
          <Ionicons
            name="qr-code-outline"
            size={21}
            color={colors.white}
          />
          <Text style={styles.buttonText}>
            Escanear otro código
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
  content: {
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 35,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 26,
  },
  headerTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '600',
  },
  headerSpace: {
    width: 26,
  },
  petCard: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    marginBottom: 24,
  },
  avatar: {
    width: 83,
    height: 83,
    borderRadius: 42,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  photo: {
    width: 83,
    height: 83,
    borderRadius: 42,
  },
  petHeaderInfo: {
    flex: 1,
    gap: 5,
  },
  petName: {
    color: colors.white,
    fontSize: 24,
    fontWeight: 'bold',
  },
  petSubtext: {
    color: colors.white,
    fontSize: 13,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 13,
    marginTop: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  detailCard: {
    flex: 1,
    minHeight: 76,
    padding: 13,
    borderRadius: 11,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  detailLabel: {
    color: colors.secondaryText,
    fontSize: 12,
  },
  detailValue: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 14,
  },
  infoCard: {
    padding: 14,
    backgroundColor: colors.lightTeal,
    borderRadius: 11,
    marginBottom: 10,
    gap: 7,
  },
  infoLabel: {
    color: colors.primaryDark,
    fontSize: 13,
    fontWeight: '600',
  },
  infoValue: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 21,
  },
  privateText: {
    color: colors.secondaryText,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 24,
  },
  button: {
    backgroundColor: colors.primary,
    minHeight: 54,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    marginTop: 15,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25,
    gap: 18,
  },
  message: {
    color: colors.secondaryText,
    fontSize: 14,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
  },
  backLink: {
    color: colors.primary,
    fontWeight: '600',
    padding: 10,
  },
});
