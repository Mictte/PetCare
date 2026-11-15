
import React, { useState } from 'react';
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

function FormField({
  control,
  errors,
  name,
  label,
  icon,
  rules,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  secureTextEntry = false,
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>
        {label}
      </Text>

      <Controller
        control={control}
        name={name}
        rules={rules}
        render={({ field: { onChange, onBlur, value } }) => (
          <View
            style={[
              styles.inputContainer,
              errors[name] && styles.inputError,
            ]}
          >
            <Ionicons
              name={icon}
              size={20}
              color={colors.secondaryText}
            />

            <TextInput
              style={styles.input}
              placeholder={label}
              placeholderTextColor={colors.secondaryText}
              keyboardType={keyboardType}
              autoCapitalize={autoCapitalize}
              autoCorrect={false}
              secureTextEntry={secureTextEntry}
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
            />
          </View>
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

export default function SignUpScreen({
  navigation,
  onSignUp,
}) {
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    control,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm({
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      password: '',
      password_confirm: '',
    },
  });

  async function onSubmit(data) {
    setLoading(true);
    setServerError('');

    try {
      await onSignUp({
        first_name: data.first_name.trim(),
        last_name: data.last_name.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone.trim(),
        password: data.password,
        password_confirm: data.password_confirm,
      });

      navigation.navigate('Login', {
        accountCreated: true,
      });
    } catch (error) {
      setServerError(error.message);
    } finally {
      setLoading(false);
    }
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
          <View style={styles.content}>
            <View style={styles.header}>
              <Pressable
                onPress={() => navigation.goBack()}
                accessibilityRole="button"
                accessibilityLabel="Regresar al inicio de sesión"
              >
                <Ionicons
                  name="chevron-back"
                  size={26}
                  color={colors.text}
                />
              </Pressable>

              <View style={styles.brandRow}>
                <Ionicons
                  name="paw"
                  size={24}
                  color={colors.primary}
                />
                <Text style={styles.brandText}>
                  PetCare
                </Text>
              </View>
            </View>

            <Text style={styles.title}>
              Crear cuenta
            </Text>

            <Text style={styles.subtitle}>
              Regístrate para administrar la información
              de tus mascotas.
            </Text>

            <FormField
              control={control}
              errors={errors}
              name="first_name"
              label="Nombre"
              icon="person-outline"
              autoCapitalize="words"
              rules={{
                required: 'El nombre es obligatorio',
              }}
            />

            <FormField
              control={control}
              errors={errors}
              name="last_name"
              label="Apellido"
              icon="people-outline"
              autoCapitalize="words"
              rules={{
                required: 'El apellido es obligatorio',
              }}
            />

            <FormField
              control={control}
              errors={errors}
              name="email"
              label="Correo electrónico"
              icon="mail-outline"
              keyboardType="email-address"
              autoCapitalize="none"
              rules={{
                required: 'El correo es obligatorio',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Ingresa un correo válido',
                },
              }}
            />

            <FormField
              control={control}
              errors={errors}
              name="phone"
              label="Teléfono"
              icon="call-outline"
              keyboardType="phone-pad"
              rules={{
                required: 'El teléfono es obligatorio',
                pattern: {
                  value: /^\+?[\d\s()-]{7,20}$/,
                  message: 'Ingresa un teléfono válido',
                },
              }}
            />

            <FormField
              control={control}
              errors={errors}
              name="password"
              label="Contraseña"
              icon="lock-closed-outline"
              autoCapitalize="none"
              secureTextEntry
              rules={{
                required: 'La contraseña es obligatoria',
                minLength: {
                  value: 8,
                  message: 'La contraseña debe tener al menos 8 caracteres',
                },
              }}
            />

            <FormField
              control={control}
              errors={errors}
              name="password_confirm"
              label="Confirmar contraseña"
              icon="shield-checkmark-outline"
              autoCapitalize="none"
              secureTextEntry
              rules={{
                required: 'Confirma tu contraseña',
                validate: (value) =>
                  value === getValues('password') ||
                  'Las contraseñas no coinciden',
              }}
            />

            {!!serverError && (
              <Text style={styles.serverError}>
                {serverError}
              </Text>
            )}

            <Pressable
              style={[
                styles.registerButton,
                loading && styles.disabledButton,
              ]}
              onPress={handleSubmit(onSubmit)}
              disabled={loading}
              accessibilityRole="button"
            >
              {loading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.buttonText}>
                  Crear cuenta
                </Text>
              )}
            </Pressable>

            <Pressable
              style={styles.loginButton}
              onPress={() => navigation.goBack()}
              disabled={loading}
            >
              <Text style={styles.loginText}>
                ¿Ya tienes cuenta? Inicia sesión
              </Text>
            </Pressable>
          </View>
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 26,
    paddingVertical: 28,
  },
  content: {
    width: '100%',
    maxWidth: 460,
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 34,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
  },
  title: {
    fontSize: 27,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.secondaryText,
    lineHeight: 21,
    marginBottom: 20,
  },
  fieldGroup: {
    marginTop: 14,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 9,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 54,
    paddingHorizontal: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
  },
  input: {
    flex: 1,
    height: 52,
    fontSize: 15,
    color: colors.text,
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: 6,
  },
  serverError: {
    fontSize: 13,
    color: colors.error,
    textAlign: 'center',
    marginTop: 18,
  },
  registerButton: {
    backgroundColor: colors.primary,
    minHeight: 52,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 28,
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  loginButton: {
    alignItems: 'center',
    padding: 16,
    marginTop: 8,
  },
  loginText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});
