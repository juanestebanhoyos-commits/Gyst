import { View, Text, StyleSheet } from 'react-native';
import { Dumbbell } from 'lucide-react-native';
import type { Exercise } from '@/types/supabase';

interface ExerciseCardProps {
  exercise: Pick<Exercise, 'name' | 'primary_muscle' | 'equipment' | 'is_custom'>;
}

export function ExerciseCard({ exercise }: ExerciseCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.iconContainer}>
        <Dumbbell color="#2563eb" size={24} />
      </View>
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{exercise.name}</Text>
          {exercise.is_custom && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Propio</Text>
            </View>
          )}
        </View>
        <Text style={styles.muscle}>{exercise.primary_muscle}</Text>
        {exercise.equipment && (
          <Text style={styles.equipment}>{exercise.equipment}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 14,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  badge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6b7280',
  },
  muscle: {
    fontSize: 14,
    color: '#6b7280',
  },
  equipment: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
});
