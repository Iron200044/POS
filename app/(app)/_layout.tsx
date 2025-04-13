// app/_layout.tsx
import { Stack } from 'expo-router'; // Usamos Stack de expo-router
import { DataProvider } from '@/context/dataContext/DataContext';
import { CartProvider } from '@/context/cartContext/cartContext';

export default function AppLayout() {
  return (
    // Expo Router maneja las rutas automáticamente
    <CartProvider>
    <DataProvider>
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="home" />
      <Stack.Screen name="index" />
      <Stack.Screen name="Admin/AdminDashboard" />
      <Stack.Screen name="Admin/MenuCRUD/[id]" />
      <Stack.Screen name="Admin/MenuDashboard" />
    </Stack>
    </DataProvider>
    </CartProvider>
  );
}
