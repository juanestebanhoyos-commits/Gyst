import { useState, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useLogSet } from '@/hooks/useLogSet';
import { useAppTheme, spacing, borderRadius, typography } from '@/lib/theme';

interface NewSetFormProps {
  workoutLogId: string;
  exerciseId: string;
  nextSetNumber: number;
  onSuccess?: () => void;
}

export function NewSetForm({ workoutLogId, exerciseId, nextSetNumber, onSuccess }: NewSetFormProps) {
  const { colors } = useAppTheme();
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

  const styles = useMemo(() => StyleSheet.create({
    container: {
      padding: spacing.lg,
      backgroundColor: colors.bgWhite,
      borderRadius: borderRadius.md,
      marginHorizontal: spacing.lg,
      marginVertical: spacing.sm,
      borderWidth: 1,
      borderColor: colors.borderLight,
    },
    heading: {
      ...typography.h3,
      color: colors.text,
      marginBottom: spacing.lg,
    },
    row: {
      flexDirection: 'row',
      gap: spacing.md,
    },
    field: {
      flex: 1,
    },
    label: {
      ...typography.small,
      color: colors.textMuted,
      marginBottom: spacing.xs,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.sm,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      fontSize: typography.body.fontSize,
      color: colors.text,
      textAlign: 'center',
      backgroundColor: colors.bgLight,
    },
    error: {
      color: colors.error,
      ...typography.small,
      marginTop: spacing.sm,
    },
    button: {
      backgroundColor: colors.primary,
      borderRadius: borderRadius.lg,
      paddingVertical: spacing.md,
      alignItems: 'center',
      marginTop: spacing.lg,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    buttonText: {
      color: colors.textOnPrimary,
      ...typography.bodyBold,
    },
  }), [colors]);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Nueva serie</Text>
      <View style={styles.row}>
        <View style={styles.field}>
          <Text style={styles.label}>Peso (KG)</Text>
          <TextInput
            style={styles.input}
            value={weight}
            onChangeText={setWeight}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={colors.textPlaceholder}
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
            placeholderTextColor={colors.textPlaceholder}
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
            placeholderTextColor={colors.textPlaceholder}
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
          <ActivityIndicator color={colors.textOnPrimary} />
        ) : (
          <Text style={styles.buttonText}>Registrar serie</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
