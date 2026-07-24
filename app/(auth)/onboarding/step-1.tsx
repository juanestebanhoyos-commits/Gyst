import { useState, useMemo } from 'react';
import { router } from 'expo-router';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { ArrowRight } from 'lucide-react-native';
import { useOnboardingLocal } from '@/hooks/useOnboardingLocal';
import { useAppTheme, spacing, borderRadius, typography } from '@/lib/theme';

export default function OnboardingStep1Screen() {
  const { colors } = useAppTheme();
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { data, isLoading, updateName } = useOnboardingLocal();

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      padding: spacing.xl,
      gap: spacing.lg,
      backgroundColor: colors.bg,
    },
    stepIndicator: {
      ...typography.small,
      color: colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 1,
      textAlign: 'center',
      marginBottom: spacing.xs,
    },
    title: {
      ...typography.h1,
      textAlign: 'center',
      color: colors.text,
    },
    subtitle: {
      ...typography.body,
      textAlign: 'center',
      color: colors.textMuted,
      marginBottom: spacing.lg,
      lineHeight: 22,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.borderLight,
      borderRadius: borderRadius.md,
      padding: spacing.lg,
      ...typography.body,
      color: colors.text,
      backgroundColor: colors.bgWhite,
    },
    button: {
      backgroundColor: colors.primary,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: spacing.sm,
    },
    buttonText: {
      color: colors.textOnPrimary,
      ...typography.bodyBold,
    },
    error: {
      color: colors.errorText,
      ...typography.caption,
      textAlign: 'center',
      backgroundColor: colors.errorBg,
      padding: spacing.md,
      borderRadius: borderRadius.sm,
    },
  }), [colors]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  async function handleContinue() {
    setError(null);

    if (!name.trim()) {
      setError('Ingresa tu nombre para continuar');
      return;
    }

    setSaving(true);
    try {
      await updateName(name.trim());
      router.push('/onboarding/step-2');
    } catch {
      setError('Error al guardar. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.stepIndicator}>Paso 1 de 2</Text>
      <Text style={styles.title}>¿Cómo te llamas?</Text>
      <Text style={styles.subtitle}>
        Usaremos tu nombre para personalizar tu experiencia
      </Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TextInput
        style={styles.input}
        placeholder="Tu nombre"
        placeholderTextColor={colors.textPlaceholder}
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
        autoComplete="name"
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleContinue}
        disabled={saving}
        activeOpacity={0.8}
      >
        {saving ? (
          <ActivityIndicator color={colors.textOnPrimary} />
        ) : (
          <ArrowRight color={colors.textOnPrimary} size={20} />
        )}
        <Text style={styles.buttonText}>
          {saving ? 'Guardando...' : 'Continuar'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
