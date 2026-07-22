import { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Plus, X } from 'lucide-react-native';
import { useAppTheme, spacing, borderRadius, typography } from '@/lib/theme';

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
  const { colors } = useAppTheme();
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

  const styles = useMemo(() => StyleSheet.create({
    section: {
      backgroundColor: colors.bgWhite,
      borderRadius: 12,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: colors.borderLight,
      gap: spacing.md,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    title: {
      ...typography.bodyBold,
      color: colors.text,
      flex: 1,
      marginRight: spacing.sm,
    },
    row: {
      flexDirection: 'row',
      gap: spacing.md,
    },
    field: {
      flex: 1,
    },
    label: {
      ...typography.captionBold,
      color: colors.textSecondary,
      marginBottom: spacing.xs,
    },
    input: {
      backgroundColor: colors.bgLight,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.sm,
      padding: 10,
      fontSize: typography.body.fontSize,
      color: colors.text,
      textAlign: 'center',
    },
    fullInput: {
      backgroundColor: colors.bgLight,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.sm,
      padding: spacing.md,
      fontSize: typography.body.fontSize,
      color: colors.text,
    },
    textArea: {
      minHeight: 60,
      textAlignVertical: 'top',
    },
    addButton: {
      backgroundColor: colors.primary,
      borderRadius: borderRadius.md,
      padding: 14,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: spacing.sm,
      marginTop: spacing.xs,
    },
    addButtonText: {
      color: colors.textOnPrimary,
      ...typography.bodyBold,
    },
    error: {
      color: colors.error,
      ...typography.caption,
      textAlign: 'center',
      backgroundColor: colors.errorBg,
      padding: 10,
      borderRadius: borderRadius.sm,
    },
  }), [colors]);

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>{exerciseName}</Text>
        {onCancel ? (
          <TouchableOpacity onPress={onCancel} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <X color={colors.textMuted} size={20} />
          </TouchableOpacity>
        ) : null}
      </View>

      {submitError ? <Text style={styles.error}>{submitError}</Text> : null}

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
          <ActivityIndicator color={colors.textOnPrimary} />
        ) : (
          <Plus color={colors.textOnPrimary} size={20} />
        )}
        <Text style={styles.addButtonText}>
          {isLoading ? 'Agregando...' : submitLabel}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
