import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Plus, X } from 'lucide-react-native';

export interface ExerciseConfig {
  target_sets: number;
  target_reps_min: number;
  target_reps_max: number;
  rest_seconds: number;
  notes: string | null;
}

interface ExerciseConfigFormProps {
  exerciseName: string;
  onSubmit: (config: ExerciseConfig) => void;
  onCancel?: () => void;
  submitLabel?: string;
  isLoading?: boolean;
}

export default function ExerciseConfigForm({
  exerciseName,
  onSubmit,
  onCancel,
  submitLabel = 'Añadir a lista',
  isLoading = false,
}: ExerciseConfigFormProps) {
  const [targetSets, setTargetSets] = useState('3');
  const [targetRepsMin, setTargetRepsMin] = useState('8');
  const [targetRepsMax, setTargetRepsMax] = useState('12');
  const [restSeconds, setRestSeconds] = useState('60');
  const [notes, setNotes] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);

  function handleSubmit() {
    const sets = parseInt(targetSets, 10);
    const repsMin = parseInt(targetRepsMin, 10);
    const repsMax = parseInt(targetRepsMax, 10);
    const rest = parseInt(restSeconds, 10);

    if (!sets || sets < 1) { setSubmitError('Series debe ser al menos 1'); return; }
    if (!repsMin || repsMin < 1) { setSubmitError('Reps mínimas debe ser al menos 1'); return; }
    if (!repsMax || repsMax < repsMin) { setSubmitError('Reps máximas debe ser mayor o igual a mínimas'); return; }

    onSubmit({
      target_sets: sets,
      target_reps_min: repsMin,
      target_reps_max: repsMax,
      rest_seconds: rest,
      notes: notes.trim() || null,
    });

    setTargetSets('3');
    setTargetRepsMin('8');
    setTargetRepsMax('12');
    setRestSeconds('60');
    setNotes('');
    setSubmitError(null);
  }

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>{exerciseName}</Text>
        {onCancel && (
          <TouchableOpacity onPress={onCancel} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <X color="#6b7280" size={20} />
          </TouchableOpacity>
        )}
      </View>

      {submitError && <Text style={styles.error}>{submitError}</Text>}

      <View style={styles.row}>
        <View style={styles.field}>
          <Text style={styles.label}>Series</Text>
          <TextInput
            style={styles.input}
            value={targetSets}
            onChangeText={setTargetSets}
            keyboardType="number-pad"
          />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Reps min</Text>
          <TextInput
            style={styles.input}
            value={targetRepsMin}
            onChangeText={setTargetRepsMin}
            keyboardType="number-pad"
          />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Reps max</Text>
          <TextInput
            style={styles.input}
            value={targetRepsMax}
            onChangeText={setTargetRepsMax}
            keyboardType="number-pad"
          />
        </View>
      </View>

      <Text style={styles.label}>Descanso (segundos)</Text>
      <TextInput
        style={styles.fullInput}
        value={restSeconds}
        onChangeText={setRestSeconds}
        keyboardType="number-pad"
      />

      <Text style={styles.label}>Notas (opcional)</Text>
      <TextInput
        style={[styles.fullInput, styles.textArea]}
        value={notes}
        onChangeText={setNotes}
        multiline
        numberOfLines={2}
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={handleSubmit}
        disabled={isLoading}
        activeOpacity={0.8}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Plus color="#fff" size={20} />
        )}
        <Text style={styles.addButtonText}>
          {isLoading ? 'Agregando...' : submitLabel}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  field: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    color: '#111827',
    textAlign: 'center',
  },
  fullInput: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
  },
  textArea: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  addButton: {
    backgroundColor: '#2563eb',
    borderRadius: 10,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  error: {
    color: '#dc2626',
    fontSize: 14,
    textAlign: 'center',
    backgroundColor: '#fef2f2',
    padding: 10,
    borderRadius: 8,
  },
});
