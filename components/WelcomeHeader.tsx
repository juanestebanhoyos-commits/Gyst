import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useMemo } from 'react';
import { useRouter } from 'expo-router';
import { useProfile } from '@/hooks/useProfile';
import { useSession } from '@/hooks/useSession';
import { useTodayRoutine } from '@/hooks/useTodayRoutine';
import { useAppTheme, spacing, borderRadius, typography } from '@/lib/theme';

const AVATAR_SIZE = 80;

export function WelcomeHeader() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const { data: todayRoutine } = useTodayRoutine();
  const { data: profile } = useProfile();
  const { user } = useSession();

  const displayName = profile?.username?.trim() || (user?.user_metadata?.name as string)?.trim() || 'atleta';
  const avatarInitial = displayName.charAt(0).toUpperCase();
  const hasRoutine = !!todayRoutine;

  const styles = useMemo(() => StyleSheet.create({
    container: {
      alignItems: 'center',
      paddingTop: spacing.xl,
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.md,
    },
    avatar: {
      width: AVATAR_SIZE,
      height: AVATAR_SIZE,
      borderRadius: AVATAR_SIZE / 2,
      backgroundColor: colors.bgLight,
      marginBottom: spacing.lg,
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarText: {
      ...typography.h2,
      color: colors.primary,
    },
    greeting: {
      ...typography.caption,
      color: colors.textMuted,
      marginBottom: spacing.xs,
    },
    headline: {
      ...typography.h1,
      color: colors.text,
      textAlign: 'center',
      marginBottom: spacing.xl,
      paddingHorizontal: spacing.lg,
    },
    button: {
      backgroundColor: colors.primary,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.xl,
      borderRadius: borderRadius.lg,
      alignItems: 'center',
      minWidth: 200,
    },
    buttonText: {
      color: colors.textOnPrimary,
      ...typography.bodyBold,
    },
  }), [colors]);

  return (
    <View style={styles.container}>
      {profile?.avatar_url ? (
        <Image
          source={{ uri: profile.avatar_url }}
          style={styles.avatar}
          accessibilityLabel="Foto de perfil"
        />
      ) : (
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{avatarInitial}</Text>
        </View>
      )}

      <Text style={styles.greeting}>Hola de nuevo</Text>
      <Text style={styles.headline}>
        ¿Qué entrenamos hoy, {displayName}?
      </Text>

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
