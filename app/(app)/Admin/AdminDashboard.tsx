// app/AdminDashboard.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { colors } from '@/constants/Colors';
import { useAuthContext } from '@/context/authContext/AuthContext';
import { useRouter } from 'expo-router';
import { getFirestore, setDoc, doc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/utils/firebaseConfig'; // Asegúrate de tener la configuración de Firebase

const AdminDashboard = () => {
  const { user, role } = useAuthContext(); // Obtén el rol del usuario
  const router = useRouter();

  // Estado para manejar los datos del nuevo usuario
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('cocinero'); // Valor por defecto

  const handleRegister = async () => {
    if (!newEmail || !newPassword) {
      Alert.alert('Error', 'Por favor ingresa todos los datos');
      return;
    }

    try {
      // 1. Crear el usuario en Firebase Authentication
      const userCredentials = await createUserWithEmailAndPassword(auth, newEmail, newPassword);
      const newUser = userCredentials.user;

      console.log('Nuevo usuario creado en Auth:', newUser);

      // 2. Guardar el usuario en Firestore
      const db = getFirestore();
      const userRef = doc(db, 'users', newUser.uid); // Usamos el uid del usuario como ID
      await setDoc(userRef, {
        email: newEmail,
        role: newRole, // Asigna el rol del nuevo usuario
      });

      console.log('Usuario registrado en Firestore:', newEmail);
      // 3. Limpiar campos y mostrar mensaje de éxito
      Alert.alert('Usuario creado', `${newRole} registrado correctamente`);
      setNewEmail('');
      setNewPassword('');
      setNewRole('cocinero');
    } catch (error: any) {
      console.error('Error al registrar usuario:', error.message);
      Alert.alert('Error', 'Hubo un problema al registrar el usuario');
    }
  };

  const handleGoBack = () => {
    router.back(); // Regresa a la pantalla anterior
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.goBackButton} onPress={handleGoBack}>
        <Text style={styles.goBackText}>← Volver</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Admin Dashboard</Text>

      <TextInput
        style={styles.input}
        placeholder="Email del nuevo usuario"
        value={newEmail}
        onChangeText={setNewEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
      />

      {/* Dropdown de selección de rol */}
      <View style={styles.dropdown}>
        <Text style={styles.dropdownLabel}>Selecciona el rol</Text>
        <TouchableOpacity onPress={() => setNewRole('cocinero')} style={styles.roleButton}>
          <Text style={styles.buttonText}>Cocinero</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setNewRole('cajero')} style={styles.roleButton}>
          <Text style={styles.buttonText}>Cajero</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setNewRole('mesero')} style={styles.roleButton}>
          <Text style={styles.buttonText}>Mesero</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Registrar Usuario</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    width: '80%',
  },
  dropdown: {
    width: '80%',
    marginBottom: 20,
  },
  dropdownLabel: {
    color: colors.buttonText,
    marginBottom: 5,
  },
  roleButton: {
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: colors.buttonText,
    fontSize: 16,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  goBackButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    padding: 10,
  },
  goBackText: {
    fontSize: 18,
    color: colors.primary,
  },
});

export default AdminDashboard;
