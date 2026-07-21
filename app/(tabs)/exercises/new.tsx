import { useState } from 'react';
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
import { Plus } from 'lucide-react-native';
import { useCreateCustomExercise } from '@/hooks/useCreateCustomExercise';
import { useSession } from '@/hooks/useSession';
import { LoadingScreen } from '@/components/LoadingScreen';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';

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
  const [name, setName] = useState('');
  const [primaryMuscle, setPrimaryMuscle] = useState('');
  const [equipment, setEquipment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { user, isLoading: sessionLoading } = useSession();
  const { mutate, isPending } = useCreateCustomExercise();

  if (sessionLoading) return <LoadingScreen />;
  if (!user) return <Redirect href="/(auth)/login" />;

  function handleCreate() {
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
  }

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

        {error && <Text style={styles.error}>{error}</Text>}

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
            <ActivityIndicator color="#fff" />
          ) : (
            <Plus color="#fff" size={20} />
          )}
          <Text style={styles.buttonText}>
            {isPending ? 'Creando...' : 'Crear ejercicio'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.sm,
    paddingBottom: 40,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
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
    fontSize: 16,
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
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  muscleChipTextActive: {
    color: '#fff',
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
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  error: {
    color: colors.errorText,
    fontSize: 14,
    textAlign: 'center',
    backgroundColor: colors.errorBg,
    padding: 10,
    borderRadius: borderRadius.sm,
  },
});
