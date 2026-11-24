
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Controller, useForm } from 'react-hook-form';

import { colors } from '../styles/colors';

function validateBirthDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return 'Utiliza el formato AAAA-MM-DD';
  }

  const [year, month, day] = value.split('-').map(Number);

  if (year < 1900) {
    return 'Ingresa una fecha válida';
  }

  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return 'La fecha no es válida';
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (date > today) {
    return 'La fecha no puede ser futura';
  }

  return true;
}

function getSpeciesForForm(species) {
  if (species?.toLowerCase() === 'dog') return 'Perro';
  if (species?.toLowerCase() === 'cat') return 'Gato';

  return species || '';
}

function FormField({
  control,
  errors,
  name,
  label,
  placeholder,
  rules,
  keyboardType = 'default',
  multiline = false,
  maxLength,
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>

      <Controller
        control={control}
        name={name}
        rules={rules}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={[
              styles.input,
              multiline && styles.multilineInput,
              errors[name] && styles.inputError,
            ]}
            placeholder={placeholder || label}
            placeholderTextColor={colors.secondaryText}
            keyboardType={keyboardType}
            multiline={multiline}
            numberOfLines={multiline ? 3 : 1}
            textAlignVertical={multiline ? 'top' : 'center'}
            maxLength={maxLength}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
          />
        )}
      />

      {errors[name] && (
        <Text style={styles.errorText}>
          {errors[name].message}
        </Text>
      )}
    </View>
  );
}

export default function PetFormScreen({
  navigation,
  route,
  onCreatePet,
  onGetPet,
  onUpdatePet,
}) {
  const petId = route.params?.petId;
  const isEditing = Boolean(petId);

  const [loading, setLoading] = useState(false);
  const [loadingPet, setLoadingPet] = useState(isEditing);
  const [loadError, setLoadError] = useState('');
  const [serverError, setServerError] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      species: '',
      breed: '',
      birth_date: '',
      sex: '',
      weight: '',
      color: '',
      distinctive_marks: '',
      observations: '',
      allergies: '',
      medical_conditions: '',
      current_medications: '',
    },
  });

  // Cargar los datos existentes cuando se edita
  useEffect(() => {
    if (!isEditing) return;

    let active = true;

    setLoadingPet(true);
    setLoadError('');

    async function loadPet() {
      try {
        const pet = await onGetPet(petId);

        if (!active) return;

        reset({
          name: pet.name || '',
          species: getSpeciesForForm(pet.species),
          breed: pet.breed || '',
          birth_date: pet.birth_date || '',
          sex: pet.sex || '',
          weight:
            pet.weight === null || pet.weight === undefined
              ? ''
              : String(pet.weight),
          color: pet.color || '',
          distinctive_marks: pet.distinctive_marks || '',
          observations: pet.observations || '',
          allergies: pet.allergies || '',
          medical_conditions: pet.medical_conditions || '',
          current_medications: pet.current_medications || '',
        });
      } catch (error) {
        if (active) {
          setLoadError(error.message);
        }
      } finally {
        if (active) {
          setLoadingPet(false);
        }
      }
    }

    loadPet();

    return () => {
      active = false;
    };
  }, [isEditing, petId, onGetPet, reset, retryCount]);

  async function onSubmit(data) {
    setLoading(true);
    setServerError('');

    const species = data.species.trim();
    const speciesLower = species.toLowerCase();

    const normalizedSpecies =
      speciesLower === 'perro'
        ? 'dog'
        : speciesLower === 'gato'
          ? 'cat'
          : species;

    const petData = {
      name: data.name.trim(),
      species: normalizedSpecies,
      breed: data.breed.trim(),
      birth_date: data.birth_date.trim(),
      sex: data.sex,
      weight: data.weight.trim()
        ? data.weight.trim().replace(',', '.')
        : null,
      color: data.color.trim(),
      distinctive_marks: data.distinctive_marks.trim(),
      observations: data.observations.trim(),
      allergies: data.allergies.trim(),
      medical_conditions: data.medical_conditions.trim(),
      current_medications: data.current_medications.trim(),
    };

    try {
      if (isEditing) {
        await onUpdatePet(petId, petData);
      } else {
        await onCreatePet(petData);
      }

      navigation.goBack();
    } catch (error) {
      setServerError(error.message);
    } finally {
      setLoading(false);
    }
  }

  if (loadingPet) {
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

  if (loadError) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.serverError}>
            {loadError}
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
            <Text style={styles.backLink}>
              Regresar
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Pressable
              onPress={() => navigation.goBack()}
              disabled={loading}
              accessibilityRole="button"
              accessibilityLabel="Regresar"
            >
              <Ionicons
                name="chevron-back"
                size={26}
                color={colors.text}
              />
            </Pressable>

            <Text style={styles.headerTitle}>
              {isEditing
                ? 'Editar mascota'
                : 'Registrar mascota'}
            </Text>

            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.photoPlaceholder}>
            <Ionicons
              name="paw"
              size={40}
              color={colors.primary}
            />
          </View>

          <Text style={styles.sectionTitle}>
            Información general
          </Text>

          <FormField
            control={control}
            errors={errors}
            name="name"
            label="Nombre *"
            placeholder="Nombre de la mascota"
            maxLength={100}
            rules={{
              required: 'El nombre es obligatorio',
              validate: (value) =>
                !!value.trim() || 'El nombre es obligatorio',
            }}
          />

          <FormField
            control={control}
            errors={errors}
            name="species"
            label="Especie *"
            placeholder="Perro, gato, ave..."
            maxLength={50}
            rules={{
              required: 'La especie es obligatoria',
              validate: (value) =>
                !!value.trim() || 'La especie es obligatoria',
            }}
          />

          <FormField
            control={control}
            errors={errors}
            name="breed"
            label="Raza"
            placeholder="Ej. Caramelo"
            maxLength={50}
          />

          <FormField
            control={control}
            errors={errors}
            name="birth_date"
            label="Fecha de nacimiento *"
            placeholder="AAAA-MM-DD"
            maxLength={10}
            rules={{
              required: 'La fecha es obligatoria',
              validate: validateBirthDate,
            }}
          />

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              Sexo *
            </Text>

            <Controller
              control={control}
              name="sex"
              rules={{
                required: 'Selecciona el sexo de la mascota',
              }}
              render={({ field: { value, onChange } }) => (
                <View style={styles.optionsRow}>
                  {[
                    { value: 'female', label: 'Hembra' },
                    { value: 'male', label: 'Macho' },
                  ].map((option) => (
                    <Pressable
                      key={option.value}
                      onPress={() => onChange(option.value)}
                      style={[
                        styles.optionButton,
                        value === option.value &&
                          styles.optionSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          value === option.value &&
                            styles.optionTextSelected,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}
            />

            {errors.sex && (
              <Text style={styles.errorText}>
                {errors.sex.message}
              </Text>
            )}
          </View>

          <FormField
            control={control}
            errors={errors}
            name="weight"
            label="Peso en kg"
            placeholder="Ej. 12.50"
            keyboardType="decimal-pad"
            rules={{
              validate: (value) => {
                if (!value.trim()) return true;

                const weight = value.trim().replace(',', '.');

                if (
                  !/^\d{1,4}(\.\d{1,2})?$/.test(weight) ||
                  Number(weight) <= 0
                ) {
                  return 'Ingresa un peso válido mayor a cero';
                }

                return true;
              },
            }}
          />

          <FormField
            control={control}
            errors={errors}
            name="color"
            label="Color"
            placeholder="Ej. Beige"
            maxLength={60}
          />

          <FormField
            control={control}
            errors={errors}
            name="distinctive_marks"
            label="Señas particulares"
            placeholder="Señas que permitan identificarla"
            multiline
          />

          <Text style={styles.sectionTitle}>
            Información importante
          </Text>

          <FormField
            control={control}
            errors={errors}
            name="allergies"
            label="Alergias"
            placeholder="Alergias conocidas"
            multiline
          />

          <FormField
            control={control}
            errors={errors}
            name="medical_conditions"
            label="Condiciones importantes"
            placeholder="Enfermedades o condiciones relevantes"
            multiline
          />

          <FormField
            control={control}
            errors={errors}
            name="current_medications"
            label="Medicamentos actuales"
            placeholder="Medicamentos que toma actualmente"
            multiline
          />

          <FormField
            control={control}
            errors={errors}
            name="observations"
            label="Observaciones"
            placeholder="Información adicional de la mascota"
            multiline
          />

          <Text style={styles.note}>
            Los campos marcados con * son obligatorios.
          </Text>

          {!!serverError && (
            <Text style={styles.serverError}>
              {serverError}
            </Text>
          )}

          <Pressable
            style={[
              styles.saveButton,
              loading && styles.disabledButton,
            ]}
            onPress={handleSubmit(onSubmit)}
            disabled={loading}
            accessibilityRole="button"
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <>
                <Ionicons
                  name="checkmark"
                  size={21}
                  color={colors.white}
                />

                <Text style={styles.saveButtonText}>
                  {isEditing
                    ? 'Guardar cambios'
                    : 'Guardar mascota'}
                </Text>
              </>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
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
  retryButton: {
    backgroundColor: colors.lightTeal,
    paddingHorizontal: 25,
    paddingVertical: 13,
    borderRadius: 10,
    marginTop: 18,
  },
  retryText: {
    color: colors.primaryDark,
    fontWeight: '600',
  },
  backLink: {
    color: colors.primary,
    marginTop: 20,
    fontWeight: '600',
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 15,
    paddingBottom: 35,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  headerTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
  },
  headerSpacer: {
    width: 26,
  },
  photoPlaceholder: {
    width: 95,
    height: 95,
    borderRadius: 48,
    backgroundColor: colors.lightTeal,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 25,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 14,
    marginBottom: 7,
  },
  fieldGroup: {
    marginTop: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    color: colors.text,
  },
  multilineInput: {
    minHeight: 95,
    paddingTop: 13,
    paddingBottom: 13,
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: 5,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  optionButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionText: {
    color: colors.text,
    fontWeight: '600',
  },
  optionTextSelected: {
    color: colors.white,
  },
  note: {
    fontSize: 12,
    color: colors.secondaryText,
    marginTop: 22,
  },
  serverError: {
    color: colors.error,
    textAlign: 'center',
    fontSize: 13,
    marginTop: 16,
  },
  saveButton: {
    flexDirection: 'row',
    minHeight: 54,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginTop: 25,
    gap: 8,
  },
  disabledButton: {
    opacity: 0.7,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
});
