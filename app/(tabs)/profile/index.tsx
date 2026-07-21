import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Save, LogOut } from 'lucide-react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useSession } from '@/hooks/useSession';
import { useUpdateProfile } from '@/hooks/useUpdateProfile';
import { useTheme } from '@/hooks/useTheme';
import { TrainingDaysPicker } from '@/components/TrainingDaysPicker';
import { LoadingScreen } from '@/components/LoadingScreen';
import { ErrorScreen } from '@/components/ErrorScreen';
import type { Database } from '@/types/supabase';

type Profile = Database['public']['Tables']['profiles']['Row'];

export default function ProfileScreen() {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const updateProfile = useUpdateProfile();
  const { themePreference, setThemePreference } = useTheme();

  function handleDarkTheme() {
    setThemePreference('dark');
  }

  function handleLightTheme() {
    setThemePreference('light');
  }

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

  async function handleSave() {
    if (!user?.id) return;

    updateProfile.mutate(
      { id: user.id, username, training_days: selectedDays },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['profile_full', user.id] });
        },
      },
    );
  }

  async function handleSignOut() {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      router.replace('/(auth)/login');
    }
  }

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
          placeholderTextColor="#9ca3af"
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
          <ActivityIndicator color="#fff" />
        ) : (
          <Save color="#fff" size={20} />
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
        <LogOut color="#dc2626" size={20} />
        <Text style={styles.signOutText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    padding: 16,
    paddingBottom: 80,
    gap: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  section: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  emailText: {
    fontSize: 16,
    color: '#6b7280',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#fff',
  },
  themeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  themeOption: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  themeOptionActive: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  themeOptionText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '600',
  },
  themeOptionTextActive: {
    color: '#2563eb',
  },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 10,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  signOutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    padding: 14,
  },
  signOutText: {
    color: '#dc2626',
    fontSize: 16,
    fontWeight: '600',
  },
});
