
import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

import { colors } from '../styles/colors';

export default function VetAccessScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <Pressable
        style={styles.backButton}
        onPress={() => navigation.goBack()}
        accessibilityRole="button"
      >
        <Ionicons
          name="chevron-back"
          size={26}
          color={colors.text}
        />
        <Text style={styles.backText}>Regresar</Text>
      </Pressable>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons
            name="medical-outline"
            size={57}
            color={colors.primary}
          />
        </View>

        <Text style={styles.title}>
          PetCare Veterinario
        </Text>

        <Text style={styles.description}>
          Consulta la información de una mascota
          escaneando el código QR de su carnet digital.
        </Text>

        <Pressable
          style={styles.scanButton}
          onPress={() => navigation.navigate('VetScanner')}
          accessibilityRole="button"
        >
          <Ionicons
            name="qr-code-outline"
            size={23}
            color={colors.white}
          />
          <Text style={styles.scanText}>
            Escanear código QR
          </Text>
        </Pressable>

        <Text style={styles.note}>
          La información disponible depende de los datos
          que el propietario haya autorizado compartir.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 24,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 15,
    gap: 5,
  },
  backText: {
    color: colors.text,
    fontSize: 15,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 22,
    paddingBottom: 55,
  },
  iconContainer: {
    width: 116,
    height: 116,
    borderRadius: 58,
    backgroundColor: colors.lightTeal,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  description: {
    color: colors.secondaryText,
    fontSize: 15,
    lineHeight: 23,
    textAlign: 'center',
  },
  scanButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 25,
    minHeight: 56,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 14,
  },
  scanText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  note: {
    color: colors.secondaryText,
    fontSize: 12,
    lineHeight: 19,
    textAlign: 'center',
  },
});
