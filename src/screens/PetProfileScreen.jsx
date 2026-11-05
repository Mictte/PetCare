import React from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

import { colors } from '../styles/colors';

const pet = {
  name: 'Tica',
  species: 'Perro',
  breed: 'Caramelo',
  sex: 'Hembra',
  birthDate: '18/06/2022',
  weight: '12 kg',
  coatColor: 'beige',
  observations: 'Muy sociable. Sensibilidad digestiva leve.',
};

function DetailField({ icon, label, value }) {
  return (
    <View style={styles.detailBox}>
      <View style={styles.detailLabelRow}>
        <Ionicons
          name={icon}
          size={17}
          color={colors.primary}
        />
        <Text style={styles.detailLabel}>{label}</Text>
      </View>

      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

export default function PetProfileScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Regresar"
          >
            <Ionicons
              name="chevron-back"
              size={24}
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
            <Ionicons
              name="paw"
              size={43}
              color={colors.primary}
            />
          </View>

          <View style={styles.petInfo}>
            <Text style={styles.petName}>
              {pet.name}
            </Text>

            <Text style={styles.petBreed}>
              {pet.breed}
            </Text>

            <View style={styles.petTag}>
              <Text style={styles.petTagText}>
                {pet.sex}
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>
          Información general
        </Text>

        <View style={styles.detailsRow}>
          <DetailField
            icon="paw-outline"
            label="Especie"
            value={pet.species}
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
            value={pet.sex}
          />

          <DetailField
            icon="calendar-outline"
            label="Nacimiento"
            value={pet.birthDate}
          />
        </View>

        <View style={styles.detailsRow}>
          <DetailField
            icon="scale-outline"
            label="Peso"
            value={pet.weight}
          />

          <DetailField
            icon="color-palette-outline"
            label="Color"
            value={pet.coatColor}
          />
        </View>

        <Text style={styles.sectionTitle}>
          Observaciones
        </Text>

        <View style={styles.observationsCard}>
          <Ionicons
            name="document-text-outline"
            size={22}
            color={colors.primary}
          />

          <Text style={styles.observationsText}>
            {pet.observations}
          </Text>
        </View>

        <Text style={styles.demoText}>
          Datos hardcodeados.
        </Text>
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
    paddingBottom: 32,
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
    marginBottom: 26,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
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
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: colors.text,
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
  observationsCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: colors.lightTeal,
    borderRadius: 12,
    padding: 16,
  },
  observationsText: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    lineHeight: 21,
  },
  demoText: {
    color: colors.secondaryText,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 24,
  },
});
