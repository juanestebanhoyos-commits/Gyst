import { useState, useMemo } from 'react';
import { Link, router } from 'expo-router';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserPlus } from 'lucide-react-native';
import { useSignup } from '@/hooks/useSignup';
import { useAppTheme, spacing, borderRadius, typography } from '@/lib/theme';

const ONBOARDING_KEY = '@gyst_onboarding';

export default function SignupScreen() {
  const { colors } = useAppTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const signup = useSignup();

  async function handleSignup() {
    setError(null);

    if (!email.trim()) {
      setError('Ingresa tu email');
      return;
    }
    if (!password) {
      setError('Ingresa tu contraseña');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    const stored = await AsyncStorage.getItem(ONBOARDING_KEY);
    const onboardingData = stored ? JSON.parse(stored) : { name: '', training_days: [] };

    signup.mutate(
      {
        email: email.trim(),
        password,
        options: {
          data: {
            name: onboardingData.name,
            training_days: onboardingData.training_days,
          },
        },
      },
      {
        onSuccess: async () => {
          await AsyncStorage.removeItem(ONBOARDING_KEY);
          router.replace('/(auth)/login');
        },
        onError: (err) => setError(err.message),
      },
    );
  }

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      padding: spacing.xl,
      gap: spacing.lg,
      backgroundColor: colors.bg,
    },
    logo: {
      fontSize: 42,
      fontWeight: '800',
      textAlign: 'center',
      color: colors.primary,
      letterSpacing: 2,
      marginBottom: spacing.xs,
    },
    subtitle: {
      ...typography.body,
      textAlign: 'center',
      color: colors.textMuted,
      marginBottom: spacing.lg,
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
    successText: {
      color: colors.successText,
      ...typography.caption,
      textAlign: 'center',
      backgroundColor: colors.successBg,
      padding: spacing.md,
      borderRadius: borderRadius.sm,
      lineHeight: 20,
    },
    footer: {
      marginTop: spacing.md,
    },
    link: {
      color: colors.primary,
      ...typography.caption,
      textAlign: 'center',
    },
  }), [colors]);

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>GYST</Text>
      <Text style={styles.subtitle}>Crear cuenta</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {success ? (
        <Text style={styles.successText}>
          ¡Cuenta creada! Revisa tu email para confirmar tu cuenta.
        </Text>
      ) : null}

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor={colors.textPlaceholder}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
      />

      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        placeholderTextColor={colors.textPlaceholder}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="new-password"
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleSignup}
        disabled={signup.isPending}
        activeOpacity={0.8}
      >
        {signup.isPending ? (
          <ActivityIndicator color={colors.textOnPrimary} />
        ) : (
          <UserPlus color={colors.textOnPrimary} size={20} />
        )}
        <Text style={styles.buttonText}>
          {signup.isPending ? 'Creando cuenta...' : 'Crear cuenta'}
        </Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Link href="/(auth)/login" style={styles.link}>
          ¿Ya tienes cuenta? Inicia sesión
        </Link>
      </View>
    </View>
  );
}
