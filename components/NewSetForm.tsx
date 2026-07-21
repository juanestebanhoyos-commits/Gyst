import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useLogSet } from '@/hooks/useLogSet';

interface NewSetFormProps {
  workoutLogId: string;
  exerciseId: string;
  nextSetNumber: number;
  onSuccess?: () => void;
}

export function NewSetForm({ workoutLogId, exerciseId, nextSetNumber, onSuccess }: NewSetFormProps) {
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [rir, setRir] = useState('');
  const [error, setError] = useState<string | null>(null);

  const logSet = useLogSet(workoutLogId);

  function handleSubmit() {
    setError(null);

    const weightNum = parseFloat(weight);
    const repsNum = parseInt(reps, 10);
    const rirNum = rir === '' ? null : parseInt(rir, 10);

    if (!weight.trim() || isNaN(weightNum) || weightNum <= 0) {
      setError('El peso debe ser un número mayor a 0');
      return;
    }
    if (!reps.trim() || isNaN(repsNum) || repsNum <= 0) {
      setError('Las reps deben ser un número mayor a 0');
      return;
    }
    if (rirNum !== null && (isNaN(rirNum) || rirNum < 0)) {
      setError('RIR debe ser 0 o un número positivo');
      return;
    }

    logSet.mutate(
      {
        exercise_id: exerciseId,
        set_number: nextSetNumber,
        weight_kg: weightNum,
        reps: repsNum,
        rir: rirNum,
      },
      {
        onSuccess: () => {
          setWeight('');
          setReps('');
          setRir('');
          onSuccess?.();
        },
        onError: (err) => setError(err.message),
      },
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Registrar serie</Text>
      <View style={styles.row}>
        <View style={styles.field}>
          <Text style={styles.label}>Peso (kg)</Text>
          <TextInput
            style={styles.input}
            value={weight}
            onChangeText={setWeight}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor="#9ca3af"
          />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Reps</Text>
          <TextInput
            style={styles.input}
            value={reps}
            onChangeText={setReps}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor="#9ca3af"
          />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>RIR</Text>
          <TextInput
            style={styles.input}
            value={rir}
            onChangeText={setRir}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor="#9ca3af"
          />
        </View>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TouchableOpacity
        style={[styles.button, logSet.isPending && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={logSet.isPending}
        activeOpacity={0.7}
      >
        {logSet.isPending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Guardar serie</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  heading: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  field: {
    flex: 1,
  },
  label: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#111827',
    textAlign: 'center',
  },
  error: {
    color: '#dc2626',
    fontSize: 13,
    marginTop: 8,
  },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
