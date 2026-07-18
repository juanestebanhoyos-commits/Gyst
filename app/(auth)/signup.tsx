import { useState } from 'react';
import { Link } from 'expo-router';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { UserPlus } from 'lucide-react-native';
import { useSignup } from '@/hooks/useSignup';

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const signup = useSignup();

  function handleSignup() {
    setError(null);
    setSuccess(false);

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

    signup.mutate(
      { email: email.trim(), password },
      {
        onSuccess: () => setSuccess(true),
        onError: (err) => setError(err.message),
      },
    );
  }

  if (success) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>GYST</Text>
        <Text style={styles.subtitle}>Registro exitoso</Text>
        <Text style={styles.successText}>
          Revisa tu correo para confirmar la cuenta. Si no ves el mensaje,
          revisa la carpeta de spam.
        </Text>
        <Link href="/(auth)/login" style={styles.link}>
          Volver a inicio de sesión
        </Link>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>GYST</Text>
      <Text style={styles.subtitle}>Crear cuenta</Text>

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
        autoComplete="new-password"
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleSignup}
        disabled={signup.isPending}
        activeOpacity={0.8}
      >
        {signup.isPending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <UserPlus color="#fff" size={20} />
        )}
        <Text style={styles.buttonText}>
          {signup.isPending ? 'Creando cuenta...' : 'Crear cuenta'}
        </Text>
      </TouchableOpacity>

      <Link href="/(auth)/login" style={styles.link}>
        ¿Ya tienes cuenta? Inicia sesión
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
  successText: {
    color: '#16a34a',
    fontSize: 14,
    textAlign: 'center',
    backgroundColor: '#f0fdf4',
    padding: 12,
    borderRadius: 8,
    lineHeight: 20,
  },
  link: {
    color: '#2563eb',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
});
