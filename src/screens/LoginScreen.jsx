import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Controller, useForm } from 'react-hook-form';

import { colors } from '../styles/colors';

export default function LoginScreen({ navigation }) {
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = () => {
    navigation.navigate('PetProfile');
  };

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

            <Text style={styles.title}>Inicio de sesión</Text>

            <Text style={styles.subtitle}>
              El cuidado de tus mascotas, en un solo lugar.
            </Text>

            <Text style={styles.label}>Correo electrónico</Text>

            <Controller
              control={control}
              name="email"
              rules={{
                required: 'El correo es obligatorio',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Ingresa un correo válido',
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <View
                  style={[
                    styles.inputContainer,
                    errors.email && styles.inputError,
                  ]}
                >
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color={colors.secondaryText}
                  />

                  <TextInput
                    style={styles.input}
                    placeholder="nombre@ejemplo.com"
                    placeholderTextColor={colors.secondaryText}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="email"
                    onChangeText={onChange}
                    onBlur={onBlur}
                    value={value}
                  />
                </View>
              )}
            />

            {errors.email && (
              <Text style={styles.errorText}>
                {errors.email.message}
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
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
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

            <Pressable
              style={styles.loginButton}
              onPress={handleSubmit(onSubmit)}
              accessibilityRole="button"
            >
              <Text style={styles.buttonText}>
                Iniciar sesión
              </Text>
            </Pressable>

            <Text style={styles.demoText}>
              Versión de prueba
            </Text>
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
    marginBottom: 32,
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
  loginButton: {
    marginTop: 30,
    backgroundColor: colors.primary,
    borderRadius: 10,
    minHeight: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  demoText: {
    fontSize: 12,
    color: colors.secondaryText,
    textAlign: 'center',
    marginTop: 16,
  },
});
