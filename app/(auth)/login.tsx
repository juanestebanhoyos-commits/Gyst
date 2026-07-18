import { useState } from 'react';
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

export default function LoginScreen() {
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>GYST</Text>
      <Text style={styles.subtitle}>Iniciar sesión</Text>

      {error && <Text style={styles.error}>{error}</Text>}

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
          <ActivityIndicator color="#fff" />
        ) : (
          <LogIn color="#fff" size={20} />
        )}
        <Text style={styles.buttonText}>
          {login.isPending ? 'Ingresando...' : 'Ingresar'}
        </Text>
      </TouchableOpacity>

      <Link href="/(auth)/signup" style={styles.link}>
        ¿No tienes cuenta? Regístrate
      </Link>
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
  title: {
    fontSize: 36,
    fontWeight: '800',
    textAlign: 'center',
    color: '#2563eb',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: '#111827',
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
  link: {
    color: '#2563eb',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
});
