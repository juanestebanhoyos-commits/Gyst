import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Save from 'lucide-react-native/icons/save';
import LogOut from 'lucide-react-native/icons/log-out';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useSession } from '@/hooks/useSession';
import { useUpdateProfile } from '@/hooks/useUpdateProfile';
import { useTheme } from '@/hooks/useTheme';
import { TrainingDaysPicker } from '@/components/TrainingDaysPicker';
import { LoadingScreen } from '@/components/LoadingScreen';
import { ErrorScreen } from '@/components/ErrorScreen';
import { useAppTheme, spacing, borderRadius, typography } from '@/lib/theme';
import type { Database } from '@/types/supabase';

type Profile = Database['public']['Tables']['profiles']['Row'];

export default function ProfileScreen() {
  const { colors } = useAppTheme();
  const { user } = useSession();
  const queryClient = useQueryClient();
  const updateProfile = useUpdateProfile();
  const { themePreference, setThemePreference } = useTheme();

  const handleDarkTheme = useCallback(() => {
    setThemePreference('dark');
  }, [setThemePreference]);

  const handleLightTheme = useCallback(() => {
    setThemePreference('light');
  }, [setThemePreference]);

  const {
    data: profile,
    isLoading,
    error,
  } = useQuery<Profile>({
    queryKey: ['profile_full', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user!.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const [username, setUsername] = useState('');
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (profile && !hydrated) {
      setUsername(profile.username ?? '');
      setSelectedDays(profile.training_days);
      setHydrated(true);
    }
  }, [profile, hydrated]);

  const handleSave = useCallback(() => {
    if (!user?.id) return;

    updateProfile.mutate(
      { id: user.id, username, training_days: selectedDays },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['profile_full', user.id] });
        },
      },
    );
  }, [user?.id, username, selectedDays, updateProfile, queryClient]);

  const handleSignOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      router.replace('/(auth)/login');
    }
  }, [router]);

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    content: {
      padding: spacing.lg,
      paddingBottom: 80,
      gap: 20,
    },
    title: {
      ...typography.h1,
      color: colors.text,
      marginBottom: spacing.xs,
    },
    section: {
      gap: spacing.sm,
    },
    label: {
      ...typography.captionBold,
      color: colors.textSecondary,
    },
    emailText: {
      ...typography.body,
      color: colors.textMuted,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      ...typography.body,
      color: colors.text,
      backgroundColor: colors.bgWhite,
    },
    themeRow: {
      flexDirection: 'row',
      gap: spacing.md,
    },
    themeOption: {
      flex: 1,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      alignItems: 'center',
      backgroundColor: colors.bgWhite,
    },
    themeOptionActive: {
      borderColor: colors.primary,
      backgroundColor: colors.primaryBg,
    },
    themeOptionText: {
      ...typography.bodyBold,
      color: colors.textSecondary,
    },
    themeOptionTextActive: {
      color: colors.primary,
    },
    button: {
      backgroundColor: colors.primary,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: spacing.sm,
    },
    buttonDisabled: {
      opacity: 0.7,
    },
    buttonText: {
      color: colors.textOnPrimary,
      ...typography.bodyBold,
    },
    signOutButton: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: spacing.sm,
      padding: spacing.md,
    },
    signOutText: {
      color: colors.errorText,
      ...typography.bodyBold,
    },
  }), [colors]);

  if (isLoading) return <LoadingScreen />;
  if (error) return <ErrorScreen message="Error al cargar perfil" />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Perfil</Text>

      <View style={styles.section}>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.emailText}>{user?.email}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Nombre</Text>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          placeholder="Tu nombre"
          placeholderTextColor={colors.textPlaceholder}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Días de entrenamiento</Text>
        <TrainingDaysPicker
          selectedDays={selectedDays}
          onChange={setSelectedDays}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Tema</Text>
      <View style={styles.themeRow}>
        <TouchableOpacity
          style={[
            styles.themeOption,
            themePreference === 'dark' && styles.themeOptionActive,
          ]}
          onPress={handleDarkTheme}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.themeOptionText,
              themePreference === 'dark' && styles.themeOptionTextActive,
            ]}
          >
            Oscuro
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.themeOption,
            themePreference === 'light' && styles.themeOptionActive,
          ]}
          onPress={handleLightTheme}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.themeOptionText,
              themePreference === 'light' && styles.themeOptionTextActive,
            ]}
          >
            Claro
          </Text>
        </TouchableOpacity>
      </View>
      </View>

      <TouchableOpacity
        style={[styles.button, updateProfile.isPending && styles.buttonDisabled]}
        onPress={handleSave}
        disabled={updateProfile.isPending}
        activeOpacity={0.8}
      >
        {updateProfile.isPending ? (
          <ActivityIndicator color={colors.textOnPrimary} />
        ) : (
          <Save color={colors.textOnPrimary} size={20} />
        )}
        <Text style={styles.buttonText}>
          {updateProfile.isPending ? 'Guardando...' : 'Guardar cambios'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.signOutButton}
        onPress={handleSignOut}
        activeOpacity={0.7}
      >
        <LogOut color={colors.errorText} size={20} />
        <Text style={styles.signOutText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

