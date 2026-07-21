import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { ProgressChart } from '@/components/ProgressChart';
import { NewSetForm } from '@/components/NewSetForm';
import { SetHistoryList } from '@/components/SetHistoryList';
import type { SetLog } from '@/types/supabase';

interface ExerciseDetailScreenProps {
  exerciseId: string;
  activeWorkoutId?: string;
  setLogs: SetLog[];
  nextSetNumber: number;
}

export function ExerciseHeaderComponent() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Press banca</Text>
        <Text style={styles.subtitle}>Pecho</Text>
      </View>

      <ProgressChart data={[]} />

      <NewSetForm workoutLogId="test" exerciseId="test" nextSetNumber={1} />

      <SetHistoryList exerciseId="test" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
});
