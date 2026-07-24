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
import { LogIn } from 'lucide-react-native';
import { useLogin } from '@/hooks/useLogin';
import { useAppTheme, spacing, borderRadius, typography } from '@/lib/theme';

export default function LoginScreen() {
  const { colors } = useAppTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const login = useLogin();

  function handleLogin() {
    setError(null);

    if (!email.trim()) {
      setError('Ingresa tu email');
      return;
    }
    if (!password) {
      setError('Ingresa tu contraseña');
      return;
    }

    login.mutate(
      { email: email.trim(), password },
      {
        onSuccess: () => router.replace('/(tabs)'),
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
      <Text style={styles.subtitle}>Iniciar sesión</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

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
        autoComplete="password"
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}
        disabled={login.isPending}
        activeOpacity={0.8}
      >
        {login.isPending ? (
          <ActivityIndicator color={colors.textOnPrimary} />
        ) : (
          <LogIn color={colors.textOnPrimary} size={20} />
        )}
        <Text style={styles.buttonText}>
          {login.isPending ? 'Ingresando...' : 'Ingresar'}
        </Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Link href="/(auth)/onboarding/step-1" style={styles.link}>
          ¿No tienes cuenta? Créala aquí
        </Link>
      </View>
    </View>
  );
}
