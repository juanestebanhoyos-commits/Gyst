import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useMemo } from 'react';
import { useRouter } from 'expo-router';
import { useSession } from '@/hooks/useSession';
import { useProfile } from '@/hooks/useProfile';
import { useTodayRoutine } from '@/hooks/useTodayRoutine';
import { useAppTheme, spacing, borderRadius, typography } from '@/lib/theme';

export function WelcomeHeader() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const { user } = useSession();
  const { data: todayRoutine } = useTodayRoutine();
  const { data: profile } = useProfile();

  const displayName = profile?.username ?? 'atleta';
  const hasRoutine = !!todayRoutine;

  const styles = useMemo(() => StyleSheet.create({
    container: {
      padding: spacing.xl,
      marginHorizontal: spacing.lg,
      marginTop: spacing.lg,
      marginBottom: spacing.sm,
      backgroundColor: colors.bgWhite,
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: colors.borderLight,
    },
    greeting: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.text,
      marginBottom: spacing.md,
    },
    button: {
      backgroundColor: colors.primary,
      paddingVertical: spacing.md,
      borderRadius: borderRadius.md,
      alignItems: 'center',
    },
    buttonText: {
      color: colors.textOnPrimary,
      ...typography.bodyBold,
    },
  }), [colors]);

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>¡Hola, {displayName}!</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          if (hasRoutine && todayRoutine) {
            router.push(`/workout/${todayRoutine.id}`);
          } else {
            router.push('/(tabs)/routines/new');
          }
        }}
      >
        <Text style={styles.buttonText}>
          {hasRoutine ? 'Empezar rutina' : 'Crear rutina'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
