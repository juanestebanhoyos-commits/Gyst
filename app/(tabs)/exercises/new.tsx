import { useState, useCallback, useMemo } from 'react';
import { router, Redirect } from 'expo-router';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import Plus from 'lucide-react-native/icons/plus';
import { useCreateCustomExercise } from '@/hooks/useCreateCustomExercise';
import { useSession } from '@/hooks/useSession';
import { LoadingScreen } from '@/components/LoadingScreen';
import { useAppTheme, spacing, borderRadius, typography } from '@/lib/theme';

const MUSCLE_GROUPS = [
  'Pecho',
  'Espalda',
  'Hombros',
  'Bíceps',
  'Tríceps',
  'Piernas',
  'Glúteos',
  'Abdomen',
  'Cardio',
];

export default function NewExerciseScreen() {
  const { colors } = useAppTheme();
  const [name, setName] = useState('');
  const [primaryMuscle, setPrimaryMuscle] = useState('');
  const [equipment, setEquipment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { user, isLoading: sessionLoading } = useSession();
  const { mutate, isPending } = useCreateCustomExercise();

  const handleCreate = useCallback(() => {
    if (!user) return;
    setError(null);

    if (!name.trim()) {
      setError('El nombre es obligatorio');
      return;
    }
    if (!primaryMuscle) {
      setError('Selecciona un grupo muscular');
      return;
    }

    mutate(
      {
        name: name.trim(),
        primary_muscle: primaryMuscle,
        equipment: equipment.trim() || null,
      },
      {
        onSuccess: () => router.replace('/(tabs)/exercises'),
        onError: (err) => setError(err.message),
      },
    );
  }, [user, name, primaryMuscle, equipment, mutate, router]);

  const styles = useMemo(() => StyleSheet.create({
    flex: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    container: {
      flex: 1,
    },
    content: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.xl,
      gap: spacing.sm,
      paddingBottom: 40,
    },
    title: {
      ...typography.caption,
      color: colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: spacing.sm,
    },
    label: {
      ...typography.captionBold,
      color: colors.textSecondary,
      marginTop: spacing.md,
      marginBottom: spacing.xs,
    },
    input: {
      backgroundColor: colors.bgWhite,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.md,
      padding: spacing.lg - 2,
      ...typography.body,
      color: colors.text,
    },
    muscleGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    muscleChip: {
      backgroundColor: colors.bgWhite,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.sm,
      paddingHorizontal: spacing.lg - 2,
      paddingVertical: spacing.sm,
    },
    muscleChipActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    muscleChipText: {
      ...typography.caption,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    muscleChipTextActive: {
      color: colors.textOnPrimary,
    },
    button: {
      backgroundColor: colors.primary,
      borderRadius: borderRadius.md,
      padding: spacing.lg - 2,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: spacing.sm,
      marginTop: 20,
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
      padding: 10,
      borderRadius: borderRadius.sm,
    },
  }), [colors]);

  if (sessionLoading) return <LoadingScreen />;
  if (!user) return <Redirect href="/(auth)/login" />;

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Nuevo ejercicio</Text>

        {error != null && <Text style={styles.error}>{error}</Text>}

        <Text style={styles.label}>Nombre</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Press banca"
          value={name}
          onChangeText={setName}
          autoCapitalize="sentences"
        />

        <Text style={styles.label}>Grupo muscular</Text>
        <View style={styles.muscleGrid}>
          {MUSCLE_GROUPS.map((mg) => (
            <TouchableOpacity
              key={mg}
              style={[
                styles.muscleChip,
                primaryMuscle === mg && styles.muscleChipActive,
              ]}
              onPress={() => setPrimaryMuscle(mg)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.muscleChipText,
                  primaryMuscle === mg && styles.muscleChipTextActive,
                ]}
              >
                {mg}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Equipo (opcional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Mancuernas, Barra"
          value={equipment}
          onChangeText={setEquipment}
          autoCapitalize="sentences"
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleCreate}
          disabled={isPending}
          activeOpacity={0.8}
        >
          {isPending ? (
            <ActivityIndicator color={colors.textOnPrimary} />
          ) : (
            <Plus color={colors.textOnPrimary} size={20} />
          )}
          <Text style={styles.buttonText}>
            {isPending ? 'Creando...' : 'Crear ejercicio'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
