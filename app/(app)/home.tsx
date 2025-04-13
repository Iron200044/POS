// app/home.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Animated } from 'react-native';
import { colors } from '../../constants/Colors';
import { useRouter } from 'expo-router';
import { NavigationIndependentTree } from '@react-navigation/native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { useAuthContext } from '@/context/authContext/AuthContext';
import { Routes } from '@/constants/Routes';
import CameraModal from '@/components/cameraModal';

// Contenido principal del Home, que muestra opciones según el rol
function HomeContent() {
  const { role } = useAuthContext(); // Obtén el rol del usuario desde el contexto
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [showScanner, setShowScanner] = useState(false);

  const [buttonsOpacity] = useState(new Animated.Value(0));

  // Función para obtener el título según el rol
  const getRoleTitle = () => {
    switch(role) {
      case 'cliente':
        return '¡Bienvenido Cliente!';
      case 'cocinero':
        return '¡Bienvenido Cocinero!';
      case 'cajero':
        return '¡Bienvenido Cajero!';
      case 'mesero':
        return '¡Bienvenido Mesero!';
      case 'admin':
        return 'Panel de Administración';
      default:
        return '¡Bienvenido!';
    }
  };

  const handleOptionPress = (route: string) => {
    router.push(route as any);
  };

  useEffect(() => {
    // Simular tiempo de carga y luego animar la aparición de los botones
    const timer = setTimeout(() => {
      setLoading(false);
      Animated.timing(buttonsOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true
      }).start();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{getRoleTitle()}</Text>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
      ) : (
        <Animated.View style={{ opacity: buttonsOpacity, width: '100%', alignItems: 'center' }}>
          {role === 'cliente' && (
            <>
              <TouchableOpacity style={styles.optionButton} onPress={() => handleOptionPress('/(app)/Cliente/clientOrders')}>
                <Text style={styles.optionText}>Ver Pedidos</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.optionButton} onPress={() => handleOptionPress('/(app)/Cliente/clientMenu')}>
                <Text style={styles.optionText}>Ver Menú</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.optionButton} onPress={() => setShowScanner(true)}>
                <Text style={styles.optionText}>Escanear QR</Text>
              </TouchableOpacity>

            </>
          )}

          {role === 'cocinero' && (
            <>
              <TouchableOpacity style={styles.optionButton} onPress={() => handleOptionPress('/(app)/Cocinero/ordersManage')}>
                <Text style={styles.optionText}>Pedidos en Cocina</Text>
              </TouchableOpacity>
            </>
          )}

          {role === 'cajero' && (
            <TouchableOpacity style={styles.optionButton} onPress={() => handleOptionPress('/(app)/Cajero/cajeroDashboard')}>
              <Text style={styles.optionText}>Panel de Caja</Text>
            </TouchableOpacity>
          )}

          {role === 'mesero' && (
            <>
              <TouchableOpacity style={styles.optionButton} onPress={() => handleOptionPress('/(app)/Mesero/tableManagement')}>
                <Text style={styles.optionText}>Gestión de mesas</Text>
              </TouchableOpacity>
            </>
          )}

          {role === 'admin' && (
            <>
              <TouchableOpacity style={styles.optionButton} onPress={() => handleOptionPress('/(app)/Admin/AdminDashboard')}>
                <Text style={styles.optionText}>Dashboard Admin</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.optionButton} onPress={() => handleOptionPress('/(app)/Admin/MenuCRUD')}>
                <Text style={styles.optionText}>Gestión del menú</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.optionButton} onPress={() => handleOptionPress('/(app)/Admin/MenuDashboard')}>
                <Text style={styles.optionText}>Ver menú</Text>
              </TouchableOpacity>
            </>
          )}
        </Animated.View>
      )}
      {/* Renderiza el CameraModal si showScanner es true */}
      {showScanner && (
        <CameraModal 
          isVisible={showScanner} 
          onClose={() => setShowScanner(false)} 
          onScanned={(mesa) => {
            console.log('Mesa escaneada:', mesa); // opcional, solo para verificar
            // Aquí podrías guardar algo localmente o hacer otra acción
          }}
        />
      )}
    </View>
  );
}

// Componente personalizado para el contenido del Drawer
function CustomDrawerContent(props: any) {
  const { logOut } = useAuthContext();
  const router = useRouter();

  const handleLogOut = async () => {
    await logOut();
    router.push('/auth'); // Redirige al login tras cerrar sesión
  };

  return (
    <DrawerContentScrollView {...props}>
      <DrawerItem
        label="Home"
        onPress={() => props.navigation.navigate('Home')}
      />
      <DrawerItem
        label="Log Out"
        onPress={handleLogOut}
      />
    </DrawerContentScrollView>
  );
}

const Drawer = createDrawerNavigator();

// HomeScreen que incluye el Drawer de forma independiente
export default function HomeScreen() {
  const { role } = useAuthContext();
  
  // Función para obtener el título de la pantalla según el rol
  const getHeaderTitle = () => {
    switch(role) {
      case 'cliente': return 'Área de Cliente';
      case 'cocinero': return 'Área de Cocina';
      case 'cajero': return 'Área de Caja';
      case 'mesero': return 'Área de Servicio';
      case 'admin': return 'Administración';
      default: return 'Inicio';
    }
  };
  
  return (
    <NavigationIndependentTree>
      <Drawer.Navigator
        initialRouteName="Home"
        drawerContent={(props) => <CustomDrawerContent {...props} />}
      >
        <Drawer.Screen
          name="Home"
          component={HomeContent}
          options={{
            headerShown: true,
            title: getHeaderTitle(),
            headerStyle: { backgroundColor: colors.primary },
            headerTintColor: colors.buttonText,
            headerTitleStyle: { fontWeight: 'bold' },
          }}
        />
      </Drawer.Navigator>
    </NavigationIndependentTree>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    color: colors.buttonText,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  optionButton: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
    width: '100%',
    alignItems: 'center',
  },
  optionText: {
    color: colors.buttonText,
    fontSize: 16,
    fontWeight: 'bold',
  },
  loader: {
    marginVertical: 30,
  }
});