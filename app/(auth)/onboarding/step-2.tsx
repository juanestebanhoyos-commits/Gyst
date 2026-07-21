import { useState } from 'react';
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

export default function OnboardingStep2Screen() {
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { data, isLoading, completeOnboarding } = useOnboardingLocal();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2563eb" />
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
                {isSelected ? <Check color="#fff" size={16} /> : null}
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
          <ActivityIndicator color="#fff" />
        ) : (
          <ArrowRight color="#fff" size={20} />
        )}
        <Text style={styles.buttonText}>
          {saving ? 'Guardando...' : 'Finalizar'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    gap: 16,
    backgroundColor: '#fff',
  },
  stepIndicator: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    color: '#111827',
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    color: '#6b7280',
    marginBottom: 8,
    lineHeight: 22,
  },
  error: {
    color: '#dc2626',
    fontSize: 14,
    textAlign: 'center',
    backgroundColor: '#fef2f2',
    padding: 10,
    borderRadius: 8,
  },
  daysContainer: {
    gap: 10,
  },
  dayChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    padding: 14,
    backgroundColor: '#fff',
  },
  dayChipSelected: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  dayText: {
    fontSize: 16,
    color: '#374151',
  },
  dayTextSelected: {
    color: '#2563eb',
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 10,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
