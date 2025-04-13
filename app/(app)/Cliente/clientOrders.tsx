import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useAuthContext } from '@/context/authContext/AuthContext';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/utils/firebaseConfig';
import { colors } from '@/constants/Colors';
import { useRouter } from 'expo-router';

// Colores para los estados de las órdenes
const statusColors = {
  'Ordenado': '#E63946', // Rojo para pedidos nuevos
  'Cocinandose': '#F4A261', // Naranja para en cocina
  'Hecho': '#2A9D8F',    // Verde para terminados
  'Listo para llevar a la mesa': '#264653', // Azul oscuro para listos
};

export default function ClientOrders() {
  const { user } = useAuthContext();
  const [orders, setOrders] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      
      const q = query(
        collection(db, 'orders'),
        where('userId', '==', user.uid)
      );

      // Usar onSnapshot para actualización en tiempo real
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const ordersList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setOrders(ordersList);
      });

      // Limpiar el listener cuando se desmonte el componente
      return () => unsubscribe();
    };

    fetchOrders();
  }, [user]);

  const renderOrder = ({ item }: any) => {
    // Obtener el color según el estado, con un color por defecto
    const statusColor = statusColors[item.status as keyof typeof statusColors] || '#cccccc';
    
    return (
      <View style={[styles.orderContainer, { borderLeftWidth: 4, borderLeftColor: statusColor }]}>
        <Text style={[styles.orderStatus, { color: statusColor }]}>
          Estado: {item.status}
        </Text>
        <Text style={styles.orderTotal}>Total: ${item.total}</Text>
        <FlatList
          data={item.items}
          renderItem={({ item }: any) => (
            <View>
              <Text style={styles.textItems}>{item.name} - {item.quantity}</Text>
            </View>
          )}
          keyExtractor={(item, index) => index.toString()}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Botón de regreso al Home */}
      <TouchableOpacity style={styles.goBackButton} onPress={() => router.push('/(app)/home')}>
        <Text style={styles.goBackText}>← Regresar</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Mis Pedidos</Text>
      <FlatList
        data={orders}
        renderItem={renderOrder}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.buttonText,
    marginBottom: 20,
    alignSelf: 'center',
  },
  orderContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: colors.inputBackground,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  orderStatus: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  orderTotal: {
    fontSize: 14,
    marginBottom: 10,
    marginTop: 5,
    color: colors.buttonText,
  },
  textItems: {
    fontSize: 14,
    marginBottom: 5,
    color: colors.buttonText,
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
    flex: 1,
  },
  tableText: {
    fontSize: 14,
    color: colors.primary,
    marginBottom: 6,
  },
});