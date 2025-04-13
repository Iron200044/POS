import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Button from '../../components/Buttons'; // Suponiendo que tienes un componente Button
import { colors } from '../../constants/Colors';
import { useRouter } from 'expo-router';
import { useAuthContext } from '@/context/authContext/AuthContext';

const LogInScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const {signIn} = useAuthContext();

  const handleLogin = async () => {
    try {
      await signIn(email, password); // Inicia sesión con el email y la contraseña
      router.push('/(app)/home'); // Redirige al Home si el login es exitoso
    } catch (error:any) {
      console.error('Error durante el inicio de sesión:', error.message);
    }
  };

  const navigateToSignUp = () => {
    router.push('/auth/signUp');  // Redirige a la pantalla de Sign Up
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Log In</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor={colors.placeholder}
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor={colors.placeholder}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Log In</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={navigateToSignUp}>
        <Text style={styles.link}>Don't have an account? Sign up</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 28,
    color: colors.buttonText,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    backgroundColor: colors.inputBackground,
    color: colors.buttonText,
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  link: {
    color: colors.primary,
    textAlign: 'center',
    marginTop: 15,
  },
  button: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: colors.buttonText,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LogInScreen;
