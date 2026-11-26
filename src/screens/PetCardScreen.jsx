
import React, { useCallback, useState } from 'react';

import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Switch,
  StyleSheet,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import QRCode from 'react-native-qrcode-svg';

import { colors } from '../styles/colors';
import { getPetPhotoUrl } from '../services/petPhotoService';

function getSpeciesName(species) {
  const value = species?.toLowerCase();

  if (value === 'dog' || value === 'perro') return 'Perro';
  if (value === 'cat' || value === 'gato') return 'Gato';

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
  if (
    value === null ||
    value === undefined ||
    String(value).trim() === ''
  ) {
    return 'No registrado';
  }

  return String(value);
}

function CardField({ label, value }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>
        {displayValue(value)}
      </Text>
    </View>
  );
}

function ImportantField({ label, value }) {
  return (
    <View style={styles.importantField}>
      <Text style={styles.importantLabel}>
        {label}
      </Text>
      <Text style={styles.importantValue}>
        {displayValue(value)}
      </Text>
    </View>
  );
}

export default function PetCardScreen({
  navigation,
  route,
  onGetPet,
  onGetCardToken,
  onUpdateCardAccess,
  onRenewPetCard,
}) {
  const petId = route.params?.petId;

  const [pet, setPet] = useState(null);
  const [cardToken, setCardToken] = useState(null);
  const [shareContact, setShareContact] = useState(false);

  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);

  const [error, setError] = useState('');
  const [settingsError, setSettingsError] = useState('');

  const [retryCount, setRetryCount] = useState(0);
  const [photoFailed, setPhotoFailed] = useState(false);
  const [confirmRenew, setConfirmRenew] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function loadCard() {
        setLoading(true);
        setError('');
        setPhotoFailed(false);

        try {
          if (!petId) {
            throw new Error('No se identificó la mascota');
          }

          const [petData, cardData] = await Promise.all([
            onGetPet(petId),
            onGetCardToken(petId),
          ]);

          if (
            !petData?.id ||
            typeof cardData?.token !== 'string'
          ) {
            throw new Error(
              'El servidor no devolvió un carnet válido'
            );
          }

          if (active) {
            setPet(petData);
            setCardToken(cardData.token);
            setShareContact(cardData.share_contact === true);
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

      loadCard();

      return () => {
        active = false;
      };
    }, [petId, onGetPet, onGetCardToken, retryCount])
  );

  // Guardar la autorización del propietario
  async function handleShareContact(value) {
    if (savingSettings) return;

    setSavingSettings(true);
    setSettingsError('');

    try {
      const data = await onUpdateCardAccess(
        petId,
        value
      );

      setShareContact(data.share_contact === true);
    } catch (err) {
      setSettingsError(err.message);
    } finally {
      setSavingSettings(false);
    }
  }

  // Invalidar el código anterior
  async function handleRenewCard() {
    if (savingSettings) return;

    setSavingSettings(true);
    setSettingsError('');

    try {
      const data = await onRenewPetCard(petId);

      if (typeof data?.token !== 'string') {
        throw new Error('No se recibió el nuevo código QR');
      }

      setCardToken(data.token);
      setShareContact(data.share_contact === true);
      setConfirmRenew(false);
    } catch (err) {
      setSettingsError(err.message);
    } finally {
      setSavingSettings(false);
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator
            size="large"
            color={colors.primary}
          />

          <Text style={styles.message}>
            Cargando carnet digital...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !pet || !cardToken) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Ionicons
            name="alert-circle-outline"
            size={42}
            color={colors.error}
          />

          <Text style={styles.errorText}>
            {error || 'No se pudo cargar el carnet'}
          </Text>

          <Pressable
            style={styles.retryButton}
            onPress={() =>
              setRetryCount(value => value + 1)
            }
          >
            <Text style={styles.retryText}>
              Reintentar
            </Text>
          </Pressable>

          <Pressable onPress={() => navigation.goBack()}>
            <Text style={styles.backLink}>
              Regresar al perfil
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const photoUrl = getPetPhotoUrl(pet.photo);
  const qrValue = `PETCARE:1:${cardToken}`;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Pressable
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Volver al perfil"
            style={styles.backButton}
          >
            <Ionicons
              name="chevron-back"
              size={26}
              color={colors.text}
            />
          </Pressable>

          <Text style={styles.headerTitle}>
            Carnet digital
          </Text>

          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons
              name="paw"
              size={25}
              color={colors.white}
            />

            <Text style={styles.cardBrand}>
              PetCare
            </Text>
          </View>

          <View style={styles.petHeader}>
            <View style={styles.avatar}>
              {photoUrl && !photoFailed ? (
                <Image
                  source={{ uri: photoUrl }}
                  style={styles.petPhoto}
                  resizeMode="cover"
                  onError={() => setPhotoFailed(true)}
                />
              ) : (
                <Ionicons
                  name="paw"
                  size={42}
                  color={colors.primary}
                />
              )}
            </View>

            <View style={styles.petInfo}>
              <Text style={styles.petName}>
                {pet.name}
              </Text>

              <Text style={styles.petDescription}>
                {pet.breed || getSpeciesName(pet.species)}
              </Text>

              <Text style={styles.petDescription}>
                {getSexName(pet.sex)}
              </Text>
            </View>
          </View>

          <View style={styles.cardBody}>
            <Text style={styles.sectionTitle}>
              Identificación
            </Text>

            <View style={styles.fieldsRow}>
              <CardField
                label="Especie"
                value={getSpeciesName(pet.species)}
              />
              <CardField
                label="Raza"
                value={pet.breed}
              />
            </View>

            <View style={styles.fieldsRow}>
              <CardField
                label="Nacimiento"
                value={formatDate(pet.birth_date)}
              />
              <CardField
                label="Peso"
                value={
                  pet.weight ? `${pet.weight} kg` : null
                }
              />
            </View>

            <View style={styles.fieldsRow}>
              <CardField
                label="Sexo"
                value={getSexName(pet.sex)}
              />
              <CardField
                label="Color"
                value={pet.color}
              />
            </View>

            <Text style={styles.sectionTitle}>
              Información importante
            </Text>

            <ImportantField
              label="Señas particulares"
              value={pet.distinctive_marks}
            />

            <ImportantField
              label="Alergias"
              value={pet.allergies}
            />

            <ImportantField
              label="Condiciones importantes"
              value={pet.medical_conditions}
            />

            <ImportantField
              label="Medicamentos actuales"
              value={pet.current_medications}
            />

            <Text style={styles.sectionTitle}>
              Código QR
            </Text>

            <View style={styles.qrContainer}>
              <View style={styles.qrBackground}>
                <QRCode
                  value={qrValue}
                  size={210}
                  color="#263D3D"
                  backgroundColor="#FFFFFF"
                  quietZone={8}
                />
              </View>

              <Text style={styles.qrTitle}>
                Identificador digital de {pet.name}
              </Text>

              <Text style={styles.qrDescription}>
                Al escanear este código desde PetCare
                Veterinario se mostrarán los datos autorizados.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.settingsCard}>
          <Text style={styles.settingsTitle}>
            Privacidad del carnet
          </Text>

          <View style={styles.privacyRow}>
            <View style={styles.privacyInfo}>
              <Text style={styles.privacyLabel}>
                Compartir datos de contacto
              </Text>

              <Text style={styles.privacyDescription}>
                Permitir mostrar mi nombre y teléfono
                a quien escanee el QR.
              </Text>
            </View>

            <Switch
              value={shareContact}
              onValueChange={handleShareContact}
              disabled={savingSettings}
              trackColor={{
                false: colors.border,
                true: colors.primary,
              }}
              thumbColor={colors.white}
            />
          </View>

          <Pressable
            style={styles.renewButton}
            onPress={() => setConfirmRenew(true)}
            disabled={savingSettings}
            accessibilityRole="button"
          >
            <Ionicons
              name="refresh-outline"
              size={20}
              color={colors.primaryDark}
            />

            <Text style={styles.renewText}>
              Renovar código QR
            </Text>
          </Pressable>

          {confirmRenew && (
            <View style={styles.confirmBox}>
              <Text style={styles.confirmText}>
                El código anterior dejará de funcionar.
                ¿Deseas generar uno nuevo?
              </Text>

              <View style={styles.confirmActions}>
                <Pressable
                  style={styles.cancelButton}
                  onPress={() => setConfirmRenew(false)}
                  disabled={savingSettings}
                >
                  <Text style={styles.cancelText}>
                    Cancelar
                  </Text>
                </Pressable>

                <Pressable
                  style={styles.confirmButton}
                  onPress={handleRenewCard}
                  disabled={savingSettings}
                >
                  {savingSettings ? (
                    <ActivityIndicator
                      color={colors.white}
                    />
                  ) : (
                    <Text style={styles.confirmButtonText}>
                      Renovar
                    </Text>
                  )}
                </Pressable>
              </View>
            </View>
          )}

          {!!settingsError && (
            <Text style={styles.errorText}>
              {settingsError}
            </Text>
          )}
        </View>

        <View style={styles.notice}>
          <Ionicons
            name="information-circle-outline"
            size={20}
            color={colors.primaryDark}
          />

          <Text style={styles.noticeText}>
            Cualquier persona que tenga una copia de este
            QR vigente podría consultar la ficha autorizada.
            Comparte el código solamente cuando sea necesario.
          </Text>
        </View>
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 35,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25,
    gap: 15,
  },
  message: {
    color: colors.secondaryText,
    fontSize: 14,
  },
  errorText: {
    color: colors.error,
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 10,
  },
  retryButton: {
    backgroundColor: colors.lightTeal,
    borderRadius: 10,
    paddingHorizontal: 28,
    paddingVertical: 14,
  },
  retryText: {
    color: colors.primaryDark,
    fontWeight: '600',
  },
  backLink: {
    color: colors.primary,
    fontWeight: '600',
    padding: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 22,
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
  card: {
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    backgroundColor: colors.primary,
    paddingHorizontal: 19,
    paddingTop: 18,
  },
  cardBrand: {
    color: colors.white,
    fontSize: 20,
    fontWeight: 'bold',
  },
  petHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    padding: 19,
    gap: 15,
  },
  avatar: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  petPhoto: {
    width: 86,
    height: 86,
    borderRadius: 43,
  },
  petInfo: {
    flex: 1,
    gap: 6,
  },
  petName: {
    color: colors.white,
    fontSize: 25,
    fontWeight: 'bold',
  },
  petDescription: {
    color: colors.white,
    fontSize: 14,
  },
  cardBody: {
    padding: 18,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 14,
  },
  fieldsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  field: {
    flex: 1,
    minHeight: 68,
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 11,
    gap: 7,
  },
  fieldLabel: {
    fontSize: 12,
    color: colors.secondaryText,
  },
  fieldValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  importantField: {
    backgroundColor: colors.lightTeal,
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    gap: 5,
  },
  importantLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primaryDark,
  },
  importantValue: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  qrContainer: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 15,
    gap: 12,
  },
  qrBackground: {
    backgroundColor: colors.white,
    padding: 12,
    borderRadius: 12,
  },
  qrTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  qrDescription: {
    color: colors.secondaryText,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
  settingsCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    marginTop: 18,
    gap: 14,
  },
  settingsTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: colors.text,
  },
  privacyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  privacyInfo: {
    flex: 1,
    gap: 5,
  },
  privacyLabel: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 14,
  },
  privacyDescription: {
    color: colors.secondaryText,
    fontSize: 12,
    lineHeight: 19,
  },
  renewButton: {
    backgroundColor: colors.lightTeal,
    minHeight: 49,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  renewText: {
    color: colors.primaryDark,
    fontWeight: '600',
  },
  confirmBox: {
    padding: 13,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    gap: 12,
  },
  confirmText: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 20,
  },
  confirmActions: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.lightTeal,
    padding: 13,
    borderRadius: 9,
    alignItems: 'center',
  },
  cancelText: {
    color: colors.primaryDark,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: colors.primary,
    padding: 13,
    borderRadius: 9,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: colors.white,
    fontWeight: '600',
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: colors.lightTeal,
    padding: 15,
    borderRadius: 12,
    marginTop: 16,
  },
  noticeText: {
    flex: 1,
    color: colors.primaryDark,
    fontSize: 13,
    lineHeight: 20,
  },
});
