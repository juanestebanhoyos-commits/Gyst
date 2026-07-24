import { useState, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Check } from 'lucide-react-native';
import { useAppTheme, spacing, borderRadius, typography } from '@/lib/theme';

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
  const { colors } = useAppTheme();
  const styles = useMemo(() => StyleSheet.create({
    card: {
      backgroundColor: colors.bgWhite,
      borderRadius: borderRadius.md,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: colors.border,
      gap: spacing.md,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    exerciseName: {
      ...typography.captionBold,
      color: colors.textSecondary,
      flex: 1,
      marginRight: spacing.sm,
    },
    setNumber: {
      ...typography.small,
      fontWeight: '600',
      color: colors.primary,
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
      ...typography.small,
      fontWeight: '600',
      color: colors.textMuted,
      marginBottom: spacing.xs,
    },
    input: {
      backgroundColor: colors.bgLight,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.sm,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      ...typography.body,
      color: colors.text,
      textAlign: 'center',
    },
    submitButton: {
      backgroundColor: colors.primary,
      width: 44,
      height: 44,
      borderRadius: borderRadius.md,
      justifyContent: 'center',
      alignItems: 'center',
    },
    error: {
      color: colors.error,
      ...typography.small,
      textAlign: 'center',
      backgroundColor: colors.errorBg,
      padding: spacing.sm,
      borderRadius: borderRadius.sm,
    },
  }), [colors]);

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

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.row}>
        <View style={styles.field}>
          <Text style={styles.label}>Peso (kg)</Text>
          <TextInput
            style={styles.input}
            value={weight}
            onChangeText={handleWeightChange}
            keyboardType="decimal-pad"
            placeholder="0"
            placeholderTextColor={colors.textPlaceholder}
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
            placeholderTextColor={colors.textPlaceholder}
          />
        </View>
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.bgWhite} size="small" />
          ) : (
            <Check color={colors.bgWhite} size={20} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
