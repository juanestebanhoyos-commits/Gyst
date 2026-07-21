import { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';
import { DAYS } from '@/constants/days';

interface TrainingDaysPickerProps {
  selectedDays: number[];
  onChange: (days: number[]) => void;
}

export const TrainingDaysPicker = memo(function TrainingDaysPicker({
  selectedDays,
  onChange,
}: TrainingDaysPickerProps) {
  const toggleDay = (dayIndex: number) => {
    onChange(
      selectedDays.includes(dayIndex)
        ? selectedDays.filter((d) => d !== dayIndex)
        : [...selectedDays, dayIndex],
    );
  };

  return (
    <View style={styles.container}>
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
  );
});

const styles = StyleSheet.create({
  container: {
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
});
