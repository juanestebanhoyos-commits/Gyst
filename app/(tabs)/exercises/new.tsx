import { useState } from 'react';
import { router } from 'expo-router';
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
  const { user } = useSession();
  const { mutate, isPending } = useCreateCustomExercise();

  function handleCreate() {
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
        userId: user!.id,
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
    backgroundColor: '#f9fafb',
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 8,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginTop: 12,
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: '#111827',
  },
  muscleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  muscleChip: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  muscleChipActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  muscleChipText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  muscleChipTextActive: {
    color: '#fff',
  },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 10,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
  },
  buttonText: {
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
