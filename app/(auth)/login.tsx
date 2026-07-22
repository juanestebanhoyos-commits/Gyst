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
      backgroundColor: colors.bgWhite,
    },
    title: {
      fontSize: 36,
      fontWeight: '800',
      textAlign: 'center',
      color: colors.primary,
    },
    subtitle: {
      fontSize: 18,
      fontWeight: '600',
      textAlign: 'center',
      color: colors.textSecondary,
      marginBottom: spacing.sm,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.md,
      padding: spacing.lg - 2,
      ...typography.body,
      color: colors.text,
    },
    button: {
      backgroundColor: colors.primary,
      borderRadius: borderRadius.md,
      padding: spacing.lg - 2,
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
      padding: 10,
      borderRadius: borderRadius.sm,
    },
    link: {
      color: colors.primary,
      ...typography.caption,
      textAlign: 'center',
      marginTop: spacing.sm,
    },
  }), [colors]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>GYST</Text>
      <Text style={styles.subtitle}>Iniciar sesión</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
      />

      <TextInput
        style={styles.input}
        placeholder="Contraseña"
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

      <Link href="/(auth)/onboarding/step-1" style={styles.link}>
        ¿No tienes cuenta? Créala aquí
      </Link>
    </View>
  );
}
