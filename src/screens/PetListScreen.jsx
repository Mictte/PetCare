
import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { colors } from '../styles/colors';

function getSpeciesName(species) {
  const value = species?.toLowerCase();

  if (value === 'dog' || value === 'perro') return 'Perro';
  if (value === 'cat' || value === 'gato') return 'Gato';

  return species || 'Sin especificar';
}

function getSexName(sex) {
  if (sex === 'female') return 'Hembra';
  if (sex === 'male') return 'Macho';

  return 'Sin especificar';
}

function PetItem({ pet }) {
  return (
    <View style={styles.petCard}>
      <View style={styles.petAvatar}>
        <Ionicons
          name="paw"
          size={30}
          color={colors.primary}
        />
      </View>

      <View style={styles.petInfo}>
        <Text style={styles.petName}>
          {pet.name}
        </Text>

        <Text style={styles.petDescription}>
          {getSpeciesName(pet.species)}
          {pet.breed ? ` · ${pet.breed}` : ''}
        </Text>

        <Text style={styles.petDetail}>
          {getSexName(pet.sex)}
          {pet.weight ? ` · ${pet.weight} kg` : ''}
        </Text>
      </View>
    </View>
  );
}

export default function PetListScreen({
  navigation,
  onGetPets,
  onSignOut,
}) {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadPets = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError('');

    try {
      const data = await onGetPets();

      const petList = Array.isArray(data)
        ? data
        : data?.results;

      if (!Array.isArray(petList)) {
        throw new Error('La lista de mascotas no es válida');
      }

      setPets(petList);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [onGetPets]);

  // Actualizar la lista al regresar del registro
  useFocusEffect(
    useCallback(() => {
      loadPets();
    }, [loadPets])
  );

  function renderPet({ item }) {
    return <PetItem pet={item} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <Ionicons
            name="paw"
            size={25}
            color={colors.primary}
          />
          <Text style={styles.brandText}>
            PetCare
          </Text>
        </View>

        <Pressable
          onPress={onSignOut}
          accessibilityRole="button"
          accessibilityLabel="Cerrar sesión"
          style={styles.logoutButton}
        >
          <Ionicons
            name="log-out-outline"
            size={25}
            color={colors.text}
          />
        </Pressable>
      </View>

      <Text style={styles.title}>Mis mascotas</Text>

      <Text style={styles.subtitle}>
        Consulta la información de tus mascotas registradas.
      </Text>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator
            size="large"
            color={colors.primary}
          />
          <Text style={styles.message}>
            Cargando mascotas...
          </Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Ionicons
            name="alert-circle-outline"
            size={42}
            color={colors.error}
          />

          <Text style={styles.errorMessage}>
            {error}
          </Text>

          <Pressable
            style={styles.retryButton}
            onPress={() => loadPets()}
          >
            <Text style={styles.retryText}>
              Reintentar
            </Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={pets}
          keyExtractor={(item) => item.id}
          renderItem={renderPet}
          contentContainerStyle={styles.listContent}
          refreshing={refreshing}
          onRefresh={() => loadPets(true)}
          ListHeaderComponent={
            <Text style={styles.countText}>
              {pets.length} {pets.length === 1
                ? 'mascota registrada'
                : 'mascotas registradas'}
            </Text>
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons
                name="paw-outline"
                size={54}
                color={colors.primary}
              />

              <Text style={styles.emptyTitle}>
                Aún no tienes mascotas
              </Text>

              <Text style={styles.emptyText}>
                Registra tu primera mascota para comenzar.
              </Text>
            </View>
          }
        />
      )}

      <Pressable
        style={styles.addButton}
        onPress={() => navigation.navigate('PetForm')}
        accessibilityRole="button"
      >
        <Ionicons
          name="add"
          size={22}
          color={colors.white}
        />

        <Text style={styles.addButtonText}>
          Agregar mascota
        </Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 22,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 15,
    marginBottom: 35,
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
  logoutButton: {
    padding: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 7,
  },
  subtitle: {
    fontSize: 14,
    color: colors.secondaryText,
    marginBottom: 22,
    lineHeight: 21,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  countText: {
    color: colors.secondaryText,
    fontSize: 13,
    marginBottom: 12,
  },
  petCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    gap: 14,
  },
  petAvatar: {
    width: 65,
    height: 65,
    backgroundColor: colors.lightTeal,
    borderRadius: 33,
    justifyContent: 'center',
    alignItems: 'center',
  },
  petInfo: {
    flex: 1,
    gap: 5,
  },
  petName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  petDescription: {
    fontSize: 13,
    color: colors.secondaryText,
  },
  petDetail: {
    fontSize: 12,
    color: colors.primaryDark,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  message: {
    marginTop: 12,
    color: colors.secondaryText,
  },
  errorMessage: {
    color: colors.error,
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 15,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  emptyText: {
    fontSize: 14,
    color: colors.secondaryText,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    minHeight: 54,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 9,
    marginBottom: 18,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
});
