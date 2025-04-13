import { Stack,Slot } from 'expo-router'; // Usamos expo-router Stack para definir rutas
import { AuthProvider } from '@/context/authContext/AuthContext';
import { DataProvider } from '@/context/dataContext/DataContext';

export default function AppLayout() {
  return (
    <AuthProvider>
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="auth" />
      <Stack.Screen name="(app)" />
    </Stack>
    </AuthProvider>
  );
}
