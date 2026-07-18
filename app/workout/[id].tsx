import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Square } from 'lucide-react-native';
import { useRoutine } from '@/hooks/useRoutine';
import { useRoutineExercises } from '@/hooks/useRoutineExercises';
import { useStartWorkout } from '@/hooks/useStartWorkout';
import { LoadingScreen } from '@/components/LoadingScreen';
import { ErrorScreen } from '@/components/ErrorScreen';
import { ListSeparator } from '@/components/ListSeparator';

export default function WorkoutSessionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: routine, isLoading: loadingRoutine } = useRoutine(id);
  const { data: exercises, isLoading: loadingExercises } = useRoutineExercises(id);
  const startWorkout = useStartWorkout();
  const hasStarted = useRef(false);

  useEffect(() => {
    if (!hasStarted.current) {
      hasStarted.current = true;
      startWorkout.mutate({ routine_id: id });
    }
  }, [id]);

  const isLoading = loadingRoutine || loadingExercises || startWorkout.isPending;

  if (isLoading) return <LoadingScreen />;
  if (startWorkout.isError || !routine)
    return <ErrorScreen message={startWorkout.error?.message ?? 'No se pudo iniciar la sesión'} />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{routine.name}</Text>
        <Text style={styles.subtitle}>Sesión activa</Text>
      </View>

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
        ItemSeparatorComponent={ListSeparator}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            Esta rutina no tiene ejercicios asignados
          </Text>
        }
      />

      <TouchableOpacity
        style={styles.finishButton}
        activeOpacity={0.8}
        onPress={() => router.replace('/(tabs)/routines')}
      >
        <Square color="#fff" size={20} />
        <Text style={styles.finishButtonText}>Finalizar</Text>
      </TouchableOpacity>
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
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: '#059669',
    fontWeight: '600',
  },
  list: {
    paddingBottom: 80,
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
  finishButton: {
    backgroundColor: '#ef4444',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  finishButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  emptyText: {
    fontSize: 15,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 24,
  },
});
