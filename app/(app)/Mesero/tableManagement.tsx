import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, SafeAreaView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { useCartContext } from '@/context/cartContext/cartContext';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/utils/firebaseConfig';
import { colors } from '@/constants/Colors';

// Interface para tipar correctamente los datos
interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  status: string;
  items: OrderItem[];
  total: number;
  createdAt: any;
  tableNumber: string;
}

export default function WaiterOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const router = useRouter();
  const { updateOrderStatus } = useCartContext();

  // Colores para los diferentes estados
  const statusColors = {
    'Listo para llevar a la mesa': '#264653', // Azul oscuro para listos
    'Entregado': '#F4A261', // Naranja para entregados
    'Listo para pagar': '#2A9D8F', // Verde para listos para pagar
  };

  // Función para actualizar el estado de una orden
  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      // Actualizamos localmente la UI antes de la operación de base de datos
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      
      // Luego actualizamos en la base de datos
      await updateOrderStatus(orderId, newStatus);
    } catch (error) {
      console.error("Error updating order status:", error);
      // Restauramos el estado original en caso de error
      setOrders(prevOrders => [...prevOrders]);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    
    // Escuchar por órdenes relevantes para el mesero (con estado "Listo para llevar a la mesa", "Entregado" o "Listo para pagar")
    const ordersQuery = query(
      collection(db, 'orders'),
      where('status', 'in', ['Listo para llevar a la mesa', 'Entregado', 'Listo para pagar']),
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(ordersQuery, (snapshot) => {
      const ordersList = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as Order));
      
      setOrders(ordersList);
      setIsLoading(false);
    }, (error) => {
      console.error("Error listening to orders:", error);
      setIsLoading(false);
    });
    
    // Limpiamos el listener cuando el componente se desmonta
    return () => unsubscribe();
  }, []);

  // Timer effect to update the current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    // Clean up the interval on component unmount
    return () => clearInterval(timer);
  }, []);

  // Función para determinar el color basado en el estado
  const getStatusColor = (status: string) => {
    return statusColors[status as keyof typeof statusColors] || colors.primary;
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp || !timestamp.toDate) return '';
    
    try {
      const date = timestamp.toDate();
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return '';
    }
  };

  // Calculate time elapsed since order was created
  const getTimeElapsed = (timestamp: any) => {
    if (!timestamp || !timestamp.toDate) return '';
    
    try {
      const orderDate = timestamp.toDate();
      const elapsedMs = currentTime.getTime() - orderDate.getTime();
      
      // Calculate hours, minutes, seconds
      const seconds = Math.floor((elapsedMs / 1000) % 60);
      const minutes = Math.floor((elapsedMs / (1000 * 60)) % 60);
      const hours = Math.floor((elapsedMs / (1000 * 60 * 60)));
      
      // Format time string
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } catch (error) {
      return '';
    }
  };

  // Get the appropriate timer color based on elapsed time
  const getTimerColor = (timestamp: any) => {
    if (!timestamp || !timestamp.toDate) return colors.primary;
    
    try {
      const orderDate = timestamp.toDate();
      const elapsedMinutes = (currentTime.getTime() - orderDate.getTime()) / (1000 * 60);
      
      // Color coding based on elapsed time
      if (elapsedMinutes < 10) {
        return '#2A9D8F'; // Green for less than 10 minutes
      } else if (elapsedMinutes < 20) {
        return '#F4A261'; // Orange for 10-20 minutes
      } else {
        return '#E63946'; // Red for more than 20 minutes
      }
    } catch (error) {
      return colors.primary;
    }
  };

  const renderOrderItem = ({ item }: { item: Order }) => (
    <View style={styles.orderItem}>
      <View style={styles.headerRow}>
        <View style={styles.statusRow}>
          <Text style={styles.orderText}>Status: </Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>

        {/* Timer display */}
        <View style={styles.timerContainer}>
          <Text style={styles.timerLabel}>Tiempo: </Text>
          <Text style={[styles.timerValue, { color: getTimerColor(item.createdAt) }]}>
            {getTimeElapsed(item.createdAt)}
          </Text>
        </View>
      </View>

      <Text style={styles.dateText}>Fecha: {formatDate(item.createdAt)}</Text>
      <Text style={styles.tableText}>Mesa: {item.tableNumber}</Text>
      <Text style={styles.orderText}>Items:</Text>
      {item.items.map((menuItem: OrderItem, index: number) => (
        <Text key={index} style={styles.itemText}>{menuItem.name} x {menuItem.quantity}</Text>
      ))}

      <Text style={styles.orderText}>Total: ${item.total}</Text>

      <View style={styles.statusContainer}>
        <Text style={styles.statusLabel}>Actualizar estado:</Text>
        <Picker
          selectedValue={item.status}
          onValueChange={(itemValue) => handleUpdateStatus(item.id, itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Listo para llevar a la mesa" value="Listo para llevar a la mesa" />
          <Picker.Item label="Entregado" value="Entregado" />
          <Picker.Item label="Listo para pagar" value="Listo para pagar" />
        </Picker>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Botón de regreso al Home */}
      <TouchableOpacity style={styles.goBackButton} onPress={() => router.push('/(app)/home')}>
        <Text style={styles.goBackText}>← Regresar</Text>
      </TouchableOpacity>
      
      <Text style={styles.title}>Panel de Órdenes del Mesero</Text>
      
      {isLoading ? (
        <Text style={styles.loadingText}>Cargando órdenes...</Text>
      ) : orders.length === 0 ? (
        <Text style={styles.noOrdersText}>No hay órdenes disponibles</Text>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={true}
          contentContainerStyle={styles.listContent}
          extraData={orders} // This ensures the list re-renders when orders change
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.background,
  },
  listContent: {
    paddingBottom: 40, // Para dar espacio extra al final de la lista
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 40, // Mayor espacio en la parte superior para el botón de regreso
    color: colors.buttonText,
    alignSelf: 'center',
  },
  orderItem: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: colors.inputBackground,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timerLabel: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: 'bold',
  },
  timerValue: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  orderText: {
    fontSize: 16,
    marginVertical: 5,
    color: colors.primary,
    fontWeight: 'bold',
  },
  dateText: {
    fontSize: 14,
    marginBottom: 10,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    marginLeft: 5,
  },
  statusText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  itemText: {
    fontSize: 14,
    marginLeft: 10,
    fontStyle: 'italic',
    color: colors.buttonText,
    marginBottom: 6,
  },
  statusContainer: {
    marginTop: 16,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    paddingBottom: 5,
    color: colors.primary,
  },
  picker: {
    height: 50,
    width: '100%',
    backgroundColor: colors.primary,
    color: colors.buttonText,
    borderRadius: 8,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: colors.primary,
  },
  noOrdersText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: colors.primary,
  },
  goBackButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    padding: 10,
    zIndex: 10,
  },
  goBackText: {
    fontSize: 18,
    color: colors.primary,
  },
  tableText: {
    fontSize: 14,
    marginBottom: 8,
    color: colors.primary,
    fontWeight: 'bold',
  },  
});