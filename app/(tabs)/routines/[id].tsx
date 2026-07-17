import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { useRoutine } from '@/hooks/useRoutine';
import { useRoutineExercises } from '@/hooks/useRoutineExercises';

export default function RoutineDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: routine, isLoading: loadingRoutine, error: routineError } = useRoutine(id);
  const {
    data: exercises,
    isLoading: loadingExercises,
    error: exercisesError,
  } = useRoutineExercises(id);

  if (loadingRoutine || loadingExercises) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (routineError || exercisesError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error al cargar la rutina</Text>
      </View>
    );
  }

  if (!routine) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Rutina no encontrada</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{routine.name}</Text>
      {routine.description && (
        <Text style={styles.description}>{routine.description}</Text>
      )}
      <Text style={styles.sectionTitle}>Ejercicios</Text>
      <FlatList
        data={exercises}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <View style={styles.exerciseCard}>
            <Text style={styles.exerciseIndex}>{index + 1}</Text>
            <View style={styles.exerciseInfo}>
              <Text style={styles.exerciseName}>
                {item.exercises?.name ?? 'Ejercicio desconocido'}
              </Text>
              {item.exercises?.primary_muscle && (
                <Text style={styles.exerciseMuscle}>
                  {item.exercises.primary_muscle}
                </Text>
              )}
            </View>
            <Text style={styles.exerciseSets}>
              {item.target_sets} × {item.target_reps_min}-{item.target_reps_max}
            </Text>
          </View>
        )}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            Esta rutina no tiene ejercicios asignados
          </Text>
        }
        ListFooterComponent={
          <TouchableOpacity
            style={styles.addButton}
            activeOpacity={0.8}
            onPress={() => router.push(`/(tabs)/routines/add-exercise?id=${id}`)}
          >
            <Plus color="#fff" size={20} />
            <Text style={styles.addButtonText}>Agregar ejercicio</Text>
          </TouchableOpacity>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  description: {
    fontSize: 15,
    color: '#6b7280',
    marginBottom: 20,
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 12,
  },
  list: {
    paddingBottom: 24,
  },
  separator: {
    height: 8,
  },
  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 12,
  },
  exerciseIndex: {
    fontSize: 16,
    fontWeight: '700',
    color: '#9ca3af',
    minWidth: 24,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  exerciseMuscle: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  exerciseSets: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
  },
  addButton: {
    backgroundColor: '#2563eb',
    borderRadius: 10,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
  },
  emptyText: {
    fontSize: 15,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 24,
  },
});
