import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/utils/firebaseConfig';
import { colors } from '@/constants/Colors';
import { OrderItem, PaidOrder } from '@/interfaces/common'; 

export default function PaidOrders() {
  const [paidOrders, setPaidOrders] = useState<PaidOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setIsLoading(true);
    
    // Listen for orders in the 'pagados' collection, ordered by paidAt timestamp
    const paidOrdersQuery = query(
      collection(db, 'pagados'),
      orderBy('paidAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(paidOrdersQuery, (snapshot) => {
      const ordersList = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as PaidOrder));
      
      setPaidOrders(ordersList);
      setIsLoading(false);
    }, (error) => {
      console.error("Error listening to paid orders:", error);
      setIsLoading(false);
    });
    
    // Clean up the listener when the component unmounts
    return () => unsubscribe();
  }, []);

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

  // Calculate time between order creation and payment
  const getTimeToPayment = (createdAt: any, paidAt: any) => {
    if (!createdAt || !createdAt.toDate || !paidAt || !paidAt.toDate) return '';
    
    try {
      const orderDate = createdAt.toDate();
      const paymentDate = paidAt.toDate();
      const elapsedMs = paymentDate.getTime() - orderDate.getTime();
      
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

  const renderOrderItem = ({ item }: { item: PaidOrder }) => (
    <View style={styles.orderItem}>
      <View style={styles.headerRow}>
        <View style={styles.statusRow}>
          <Text style={styles.orderText}>Estado: </Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>Pagado</Text>
          </View>
        </View>
      </View>

      <Text style={styles.dateText}>Fecha de creación: {formatDate(item.createdAt)}</Text>
      <Text style={styles.dateText}>Fecha de pago: {formatDate(item.paidAt)}</Text>
      <Text style={styles.tableText}>Mesa: {item.tableNumber}</Text>
      
      <View style={styles.timeContainer}>
        <Text style={styles.timeLabel}>Tiempo hasta pago: </Text>
        <Text style={styles.timeValue}>
          {getTimeToPayment(item.createdAt, item.paidAt)}
        </Text>
      </View>
      
      <Text style={styles.orderText}>Items:</Text>
      {item.items.map((menuItem: OrderItem, index: number) => (
        <Text key={index} style={styles.itemText}>
          {menuItem.name} x {menuItem.quantity} (${parseFloat(menuItem.price.toString()) * menuItem.quantity})
        </Text>
      ))}

      <Text style={styles.totalText}>Total: ${item.total.toFixed(2)}</Text>
      <Text style={styles.idText}>ID Original: {item.originalOrderId}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Back button */}
      <TouchableOpacity style={styles.goBackButton} onPress={() => router.push('/(app)/home')}>
        <Text style={styles.goBackText}>← Regresar</Text>
      </TouchableOpacity>
      
      <Text style={styles.title}>Historial de Órdenes Pagadas</Text>
      
      {isLoading ? (
        <Text style={styles.loadingText}>Cargando órdenes pagadas...</Text>
      ) : paidOrders.length === 0 ? (
        <Text style={styles.noOrdersText}>No hay órdenes pagadas disponibles</Text>
      ) : (
        <FlatList
          data={paidOrders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={true}
          contentContainerStyle={styles.listContent}
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
    paddingBottom: 40, // Extra space at the end of the list
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 40, // More space at the top for the back button
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
  orderText: {
    fontSize: 16,
    marginVertical: 5,
    color: colors.primary,
    fontWeight: 'bold',
  },
  dateText: {
    fontSize: 14,
    marginBottom: 6,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    marginLeft: 5,
    backgroundColor: '#2A9D8F', // Green for paid status
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
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  timeLabel: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: 'bold',
  },
  timeValue: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    color: '#2A9D8F', // Green for completed time
  },
  totalText: {
    fontSize: 18,
    marginTop: 10,
    color: colors.primary,
    fontWeight: 'bold',
  },
  idText: {
    fontSize: 12,
    marginTop: 10,
    color: '#666',
    fontStyle: 'italic',
  },
});