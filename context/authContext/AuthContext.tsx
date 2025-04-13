import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../../utils/firebaseConfig';
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User,
} from 'firebase/auth';
import { doc, setDoc, getFirestore, getDoc, updateDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';


interface AuthContextValue {
  user: User | null;
  role: string | null;
  mesa: string | null; // Nuevo campo para almacenar datos del QR
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  logOut: () => Promise<void>;
  updatemesa: (qrText: string) => Promise<void>; // Nueva función para actualizar datos del QR
  loading: boolean;
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  role: null,
  mesa: null, // Inicializado como null por defecto
  signUp: async () => {},
  signIn: async () => {},
  logOut: async () => {},
  updatemesa: async () => {}, // Nueva función
  loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [mesa, setmesa] = useState<string | null>(null); // Estado para datos del QR
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const db = getFirestore();
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          setRole(data.role || 'cliente');
          // Si existe el campo mesa, lo cargamos
          if (data.mesa) {
            setmesa(data.mesa);
          }
        } else {
          // Si no existe el documento, asignamos 'Cliente' por defecto
          setRole('cliente');
        }
      } else {
        setUser(null);
        setRole(null);
        setmesa(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      const userCredentials = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredentials.user;
      const db = getFirestore();
      // Guarda el documento en la colección 'users' con el rol 'Cliente' y mesa vacío
      await setDoc(doc(db, 'users', newUser.uid), {
        email: newUser.email,
        role: 'cliente',
        mesa: '', // Campo vacío por defecto
      });
    } catch (error: any) {
      console.error('Error durante el registro: ', error.message);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.error('Error durante el inicio de sesión: ', error.message);
      throw error;
    }
  };

  const logOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setRole(null);
      setmesa(null);
    } catch (error: any) {
      console.error('Error al cerrar sesión: ', error.message);
      throw error;
    }
  };

  // Nueva función para actualizar los datos del QR
  const updatemesa = async (qrText: string) => {
    try {
      if (user) {
        const db = getFirestore();
        const userRef = doc(db, 'users', user.uid);
        
        // Actualizar en Firestore
        await updateDoc(userRef, {
          mesa: qrText
        });
        
        // Actualizar el estado local
        setmesa(qrText);
      } else {
        throw new Error('No hay usuario autenticado');
      }
    } catch (error: any) {
      console.error('Error al actualizar datos del QR: ', error.message);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, role, mesa, signUp, signIn, logOut, updatemesa, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);