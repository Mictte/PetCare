
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

export default function LoginScreen({
  navigation,
  route,
  onLogin,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      username: '',
      password: '',
    },
  });

  async function onSubmit(data) {
    setServerError('');
    setLoading(true);

    try {
      await onLogin({
        username: data.username.trim(),
        password: data.password,
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
            <View style={styles.brandRow}>
              <Ionicons
                name="paw"
                size={28}
                color={colors.primary}
              />
              <Text style={styles.brandText}>PetCare</Text>
            </View>

            <Text style={styles.title}>
              Inicio de sesión
            </Text>

            <Text style={styles.subtitle}>
              El cuidado de tus mascotas, en un solo lugar.
            </Text>

            {route?.params?.accountCreated && (
              <Text style={styles.successText}>
                Cuenta creada correctamente. Ya puedes iniciar sesión.
              </Text>
            )}

            <Text style={styles.label}>Usuario</Text>

            <Controller
              control={control}
              name="username"
              rules={{
                required: 'El usuario es obligatorio',
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <View
                  style={[
                    styles.inputContainer,
                    errors.username && styles.inputError,
                  ]}
                >
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color={colors.secondaryText}
                  />

                  <TextInput
                    style={styles.input}
                    placeholder="Nombre de usuario"
                    placeholderTextColor={colors.secondaryText}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="username"
                    onChangeText={onChange}
                    onBlur={onBlur}
                    value={value}
                  />
                </View>
              )}
            />

            {errors.username && (
              <Text style={styles.errorText}>
                {errors.username.message}
              </Text>
            )}

            <Text style={styles.label}>Contraseña</Text>

            <Controller
              control={control}
              name="password"
              rules={{
                required: 'La contraseña es obligatoria',
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <View
                  style={[
                    styles.inputContainer,
                    errors.password && styles.inputError,
                  ]}
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={colors.secondaryText}
                  />

                  <TextInput
                    style={styles.input}
                    placeholder="Ingresa tu contraseña"
                    placeholderTextColor={colors.secondaryText}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoComplete="password"
                    onChangeText={onChange}
                    onBlur={onBlur}
                    value={value}
                  />

                  <Pressable
                    onPress={() => setShowPassword(!showPassword)}
                    accessibilityRole="button"
                    accessibilityLabel={
                      showPassword
                        ? 'Ocultar contraseña'
                        : 'Mostrar contraseña'
                    }
                  >
                    <Ionicons
                      name={
                        showPassword
                          ? 'eye-off-outline'
                          : 'eye-outline'
                      }
                      size={22}
                      color={colors.primary}
                    />
                  </Pressable>
                </View>
              )}
            />

            {errors.password && (
              <Text style={styles.errorText}>
                {errors.password.message}
              </Text>
            )}

            {!!serverError && (
              <Text style={styles.serverError}>
                {serverError}
              </Text>
            )}

            <Pressable
              style={[
                styles.loginButton,
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
                  Iniciar sesión
                </Text>
              )}
            </Pressable>

            <Pressable
              style={styles.signupButton}
              onPress={() => navigation.navigate('SignUp')}
              disabled={loading}
              accessibilityRole="button"
            >
              <Text style={styles.signupText}>
                ¿No tienes cuenta? Regístrate
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
    justifyContent: 'center',
    paddingHorizontal: 26,
    paddingVertical: 32,
  },
  content: {
    width: '100%',
    maxWidth: 460,
    alignSelf: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 40,
  },
  brandText: {
    fontSize: 23,
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
    marginBottom: 28,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 9,
    marginTop: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 54,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    backgroundColor: colors.surface,
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
    color: colors.error,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 16,
  },
  successText: {
    color: colors.primaryDark,
    backgroundColor: colors.lightTeal,
    borderRadius: 10,
    padding: 12,
    fontSize: 13,
    marginBottom: 8,
  },
  loginButton: {
    marginTop: 30,
    backgroundColor: colors.primary,
    borderRadius: 10,
    minHeight: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  signupButton: {
    alignItems: 'center',
    padding: 16,
    marginTop: 8,
  },
  signupText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});
