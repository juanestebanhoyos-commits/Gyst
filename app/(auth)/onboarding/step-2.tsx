import { useState, useMemo } from 'react';
import { router } from 'expo-router';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Check, ArrowRight } from 'lucide-react-native';
import { useOnboardingLocal } from '@/hooks/useOnboardingLocal';
import { DAYS } from '@/constants/days';
import { useAppTheme, spacing, borderRadius, typography } from '@/lib/theme';

export default function OnboardingStep2Screen() {
  const { colors } = useAppTheme();
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { data, isLoading, completeOnboarding } = useOnboardingLocal();

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      padding: spacing.xl,
      gap: spacing.lg,
      backgroundColor: colors.bgWhite,
    },
    stepIndicator: {
      ...typography.captionBold,
      color: colors.textMuted,
      textAlign: 'center',
      marginBottom: spacing.xs,
    },
    title: {
      ...typography.h2,
      textAlign: 'center',
      color: colors.text,
    },
    subtitle: {
      fontSize: 15,
      textAlign: 'center',
      color: colors.textMuted,
      marginBottom: spacing.sm,
      lineHeight: 22,
    },
    error: {
      color: colors.error,
      ...typography.caption,
      textAlign: 'center',
      backgroundColor: colors.errorBg,
      padding: 10,
      borderRadius: borderRadius.sm,
    },
    daysContainer: {
      gap: 10,
    },
    dayChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.md,
      padding: spacing.lg - 2,
      backgroundColor: colors.bgWhite,
    },
    dayChipSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.primaryBg,
    },
    checkbox: {
      width: 22,
      height: 22,
      borderRadius: 6,
      borderWidth: 2,
      borderColor: colors.border,
      justifyContent: 'center',
      alignItems: 'center',
    },
    checkboxSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    dayText: {
      ...typography.body,
      color: colors.textSecondary,
    },
    dayTextSelected: {
      color: colors.primary,
      fontWeight: '600',
    },
    button: {
      backgroundColor: colors.primary,
      borderRadius: borderRadius.md,
      padding: spacing.lg - 2,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: spacing.sm,
      marginTop: spacing.sm,
    },
    buttonText: {
      color: colors.textOnPrimary,
      ...typography.bodyBold,
    },
  }), [colors]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  function toggleDay(dayIndex: number) {
    setError(null);
    setSelectedDays((prev) =>
      prev.includes(dayIndex)
        ? prev.filter((d) => d !== dayIndex)
        : [...prev, dayIndex],
    );
  }

  async function handleFinish() {
    setError(null);

    if (selectedDays.length === 0) {
      setError('Selecciona al menos un día');
      return;
    }

    setSaving(true);
    try {
      await completeOnboarding(data.name, selectedDays.sort());
      router.replace('/(auth)/signup');
    } catch {
      setError('Error al guardar. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.stepIndicator}>Paso 2 de 2</Text>
      <Text style={styles.title}>
        {data.name ? `${data.name}, ¿qué días entrenas?` : '¿Qué días entrenas?'}
      </Text>
      <Text style={styles.subtitle}>
        Selecciona los días que planeas entrenar cada semana
      </Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.daysContainer}>
        {DAYS.slice(1).map((day, i) => {
          const dayIndex = i + 1;
          const isSelected = selectedDays.includes(dayIndex);
          return (
            <TouchableOpacity
              key={dayIndex}
              style={[styles.dayChip, isSelected && styles.dayChipSelected]}
              onPress={() => toggleDay(dayIndex)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.checkbox,
                  isSelected && styles.checkboxSelected,
                ]}
              >
                {isSelected ? <Check color={colors.textOnPrimary} size={16} /> : null}
              </View>
              <Text
                style={[
                  styles.dayText,
                  isSelected && styles.dayTextSelected,
                ]}
              >
                {day}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={handleFinish}
        disabled={saving}
        activeOpacity={0.8}
      >
        {saving ? (
          <ActivityIndicator color={colors.textOnPrimary} />
        ) : (
          <ArrowRight color={colors.textOnPrimary} size={20} />
        )}
        <Text style={styles.buttonText}>
          {saving ? 'Guardando...' : 'Finalizar'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
