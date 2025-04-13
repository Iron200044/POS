import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert
} from 'react-native';
import Button from '../../components/Buttons';
import { colors } from '@/constants/Colors';
import { useRouter } from 'expo-router';
import { useAuthContext } from '@/context/authContext/AuthContext';

const SignUpScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  
  const router = useRouter();
  const { signUp } = useAuthContext();

  // Validación de email
  const validateEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('El correo electrónico es obligatorio');
      return false;
    } else if (!emailRegex.test(email)) {
      setEmailError('Introduce un correo electrónico válido');
      return false;
    }
    setEmailError('');
    return true;
  };

  // Validación de contraseña
  const validatePassword = () => {
    if (!password) {
      setPasswordError('La contraseña es obligatoria');
      return false;
    } else if (password.length < 6) {
      setPasswordError('La contraseña debe tener al menos 6 caracteres');
      return false;
    }
    setPasswordError('');
    return true;
  };

  // Validación de confirmación de contraseña
  const validateConfirmPassword = () => {
    if (password !== confirmPassword) {
      setConfirmPasswordError('Las contraseñas no coinciden');
      return false;
    }
    setConfirmPasswordError('');
    return true;
  };

  const handleSignUp = async () => {
    // Validar todos los campos
    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();
    const isConfirmPasswordValid = validateConfirmPassword();

    if (!isEmailValid || !isPasswordValid || !isConfirmPasswordValid) {
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password);
      router.push('/(app)/home');
    } catch (error: any) {
      // Manejo específico de errores de Firebase
      if (error.code === 'auth/email-already-in-use') {
        setEmailError('Este correo electrónico ya está registrado');
      } else if (error.code === 'auth/invalid-email') {
        setEmailError('El formato del correo electrónico no es válido');
      } else if (error.code === 'auth/weak-password') {
        setPasswordError('La contraseña es demasiado débil');
      } else {
        Alert.alert(
          'Error de registro',
          'Ocurrió un error durante el registro. Por favor, inténtalo de nuevo.',
          [{ text: 'OK' }]
        );
      }
      console.error('Error durante el registro:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const navigateToLogIn = () => {
    router.push('/auth');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Crear Cuenta</Text>
      
      <Text style={styles.inputLabel}>Correo Electrónico</Text>
      <TextInput
        style={[styles.input, emailError ? styles.inputError : null]}
        placeholder="ejemplo@correo.com"
        placeholderTextColor={colors.placeholder}
        value={email}
        onChangeText={setEmail}
        onBlur={validateEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

      <Text style={styles.inputLabel}>Contraseña</Text>
      <TextInput
        style={[styles.input, passwordError ? styles.inputError : null]}
        placeholder="Al menos 6 caracteres"
        placeholderTextColor={colors.placeholder}
        value={password}
        onChangeText={setPassword}
        onBlur={validatePassword}
        secureTextEntry
      />
      {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

      <Text style={styles.inputLabel}>Confirmar Contraseña</Text>
      <TextInput
        style={[styles.input, confirmPasswordError ? styles.inputError : null]}
        placeholder="Repite tu contraseña"
        placeholderTextColor={colors.placeholder}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        onBlur={validateConfirmPassword}
        secureTextEntry
      />
      {confirmPasswordError ? <Text style={styles.errorText}>{confirmPasswordError}</Text> : null}

      <TouchableOpacity 
        style={[styles.button, loading ? styles.buttonDisabled : null]} 
        onPress={handleSignUp}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={colors.buttonText} size="small" />
        ) : (
          <Text style={styles.buttonText}>Registrarse</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={navigateToLogIn}>
        <Text style={styles.link}>¿Ya tienes una cuenta? Inicia sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 28,
    color: colors.buttonText,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 14,
    color: colors.buttonText,
    marginBottom: 5,
    fontWeight: '500',
  },
  input: {
    backgroundColor: colors.inputBackground,
    color: colors.buttonText,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  inputError: {
    borderColor: colors.error || 'red',
  },
  errorText: {
    color: colors.error || 'red',
    fontSize: 12,
    marginBottom: 10,
    marginTop: -5,
  },
  button: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 15,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: colors.buttonText,
    fontSize: 16,
    fontWeight: 'bold',
  },
  link: {
    color: colors.primary,
    textAlign: 'center',
    marginTop: 15,
  },
});

export default SignUpScreen;