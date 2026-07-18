import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Check } from 'lucide-react-native';

interface SetInputProps {
  exerciseName: string;
  setIndex: number;
  onSubmit: (weight: number, reps: number) => void;
  isLoading?: boolean;
}

export function SetInput({ exerciseName, setIndex, onSubmit, isLoading = false }: SetInputProps) {
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleWeightChange(text: string) {
    if (text.startsWith('-')) return;
    setWeight(text);
  }

  function handleRepsChange(text: string) {
    if (text.startsWith('-') || text.includes('.')) return;
    setReps(text);
  }

  function handleSubmit() {
    const parsedWeight = parseFloat(weight);
    const parsedReps = parseInt(reps, 10);

    if (weight === '' || isNaN(parsedWeight) || parsedWeight < 0) {
      setError('El peso debe ser un número válido ≥ 0');
      return;
    }
    if (reps === '' || isNaN(parsedReps) || parsedReps < 0) {
      setError('Las repeticiones deben ser un número válido ≥ 0');
      return;
    }

    setError(null);
    onSubmit(parsedWeight, parsedReps);
    setWeight('');
    setReps('');
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.exerciseName} numberOfLines={1}>{exerciseName}</Text>
        <Text style={styles.setNumber}>Serie {setIndex}</Text>
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      <View style={styles.row}>
        <View style={styles.field}>
          <Text style={styles.label}>Peso (kg)</Text>
          <TextInput
            style={styles.input}
            value={weight}
            onChangeText={handleWeightChange}
            keyboardType="decimal-pad"
            placeholder="0"
            placeholderTextColor="#9ca3af"
          />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Reps</Text>
          <TextInput
            style={styles.input}
            value={reps}
            onChangeText={handleRepsChange}
            keyboardType="number-pad"
            placeholder="0"
            placeholderTextColor="#9ca3af"
          />
        </View>
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Check color="#fff" size={20} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exerciseName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
    marginRight: 8,
  },
  setNumber: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563eb',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-end',
  },
  field: {
    flex: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
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
  submitButton: {
    backgroundColor: '#2563eb',
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    color: '#dc2626',
    fontSize: 13,
    textAlign: 'center',
    backgroundColor: '#fef2f2',
    padding: 8,
    borderRadius: 8,
  },
});
