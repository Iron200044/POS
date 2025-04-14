import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, SafeAreaView, Modal } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { useCartContext } from '@/context/cartContext/cartContext';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/utils/firebaseConfig';
import { colors } from '@/constants/Colors';
import { Order } from '@/interfaces/common'; 

export default function CashierDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const router = useRouter();
  const { updateOrderStatus } = useCartContext();

  // Colores para los diferentes estados
  const statusColors = {
    'Ordenado': '#E63946', // Rojo para pedidos nuevos
    'Cocinandose': '#F4A261', // Naranja para en cocina
    'Hecho': '#2A9D8F', // Verde para terminados
    'Listo para llevar a la mesa': '#264653', // Azul oscuro para listos
    'Entregado': '#F4A261', // Naranja para entregados
    'Listo para pagar': '#2A9D8F', // Verde para listos para pagar
    'Pagado': '#333333', // Negro para pagados
  };

  useEffect(() => {
    setIsLoading(true);
    
    // Configuramos un listener en tiempo real para todas las órdenes
    const ordersQuery = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    
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

  // Filtrar órdenes cuando cambia el filtro de estado o la lista de órdenes
  useEffect(() => {
    if (statusFilter === "all") {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter(order => order.status === statusFilter));
    }
  }, [statusFilter, orders]);

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

  // Función para confirmar el pago de una orden
  const confirmPayment = async () => {
    if (!selectedOrder) return;
    
    try {
      await updateOrderStatus(selectedOrder.id, "Pagado");
      setPaymentModalVisible(false);
      setSelectedOrder(null);
    } catch (error) {
      console.error("Error updating payment status:", error);
    }
  };

  // Renderizado del detalle de la factura
  const renderBillDetails = () => {
    if (!selectedOrder) return null;
    
    const subtotal = selectedOrder.total * 0.85; // 85% del total
    const tax = selectedOrder.total * 0.15; // 15% del total
    
    return (
      <View style={styles.billContainer}>
        <Text style={styles.billTitle}>Detalle de Factura</Text>
        <Text style={styles.billTableInfo}>Mesa: {selectedOrder.tableNumber}</Text>
        <Text style={styles.billDateInfo}>Fecha: {formatDate(selectedOrder.createdAt)}</Text>
        
        <View style={styles.billItemsHeader}>
          <Text style={[styles.billItemText, {flex: 2}]}>Item</Text>
          <Text style={[styles.billItemText, {flex: 1, textAlign: 'center'}]}>Cant.</Text>
          <Text style={[styles.billItemText, {flex: 1, textAlign: 'right'}]}>Precio</Text>
          <Text style={[styles.billItemText, {flex: 1, textAlign: 'right'}]}>Total</Text>
        </View>
        
        {selectedOrder.items.map((item, index) => {
          // Asegurarse de que el precio sea un string
          const priceStr = typeof item.price === 'number' ? item.price.toString() : item.price;
          
          return (
            <View key={index} style={styles.billItemRow}>
              <Text style={[styles.billItemDetailText, {flex: 2}]}>{item.name}</Text>
              <Text style={[styles.billItemDetailText, {flex: 1, textAlign: 'center'}]}>{item.quantity}</Text>
              <Text style={[styles.billItemDetailText, {flex: 1, textAlign: 'right'}]}>${priceStr}</Text>
              <Text style={[styles.billItemDetailText, {flex: 1, textAlign: 'right'}]}>
                ${(parseFloat(priceStr) * item.quantity).toFixed(2)}
              </Text>
            </View>
          );
        })}
        
        <View style={styles.billSummary}>
          <View style={styles.billTotalRow}>
            <Text style={styles.billTotalLabel}>Subtotal:</Text>
            <Text style={styles.billTotalValue}>${subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.billTotalRow}>
            <Text style={styles.billTotalLabel}>Impuesto (15%):</Text>
            <Text style={styles.billTotalValue}>${tax.toFixed(2)}</Text>
          </View>
          <View style={[styles.billTotalRow, styles.finalTotal]}>
            <Text style={[styles.billTotalLabel, styles.finalTotalText]}>Total:</Text>
            <Text style={[styles.billTotalValue, styles.finalTotalText]}>${selectedOrder.total.toFixed(2)}</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderOrderItem = ({ item }: { item: Order }) => {
    return (
      <TouchableOpacity 
        style={styles.orderItem}
        onPress={() => {
          if (item.status === "Listo para pagar") {
            setSelectedOrder(item);
            setPaymentModalVisible(true);
          }
        }}
        disabled={item.status !== "Listo para pagar"}
      >
        <View style={styles.headerRow}>
          <View style={styles.idRow}>
            <Text style={styles.orderIdText}>ID: {item.id.substring(0, 8)}...</Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.orderText}>Status: </Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
              <Text style={styles.statusText}>{item.status}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.dateText}>Fecha: {formatDate(item.createdAt)}</Text>
        <Text style={styles.tableText}>Mesa: {item.tableNumber}</Text>
        <Text style={styles.orderText}>Items:</Text>
        {item.items.map((menuItem, index) => {
          // Asegurarse de que el precio sea un string
          const priceStr = typeof menuItem.price === 'number' ? menuItem.price.toString() : menuItem.price;
          
          return (
            <Text key={index} style={styles.itemText}>
              {menuItem.name} x {menuItem.quantity} = ${(parseFloat(priceStr) * menuItem.quantity).toFixed(2)}
            </Text>
          );
        })}

        <View style={styles.totalContainer}>
          <Text style={styles.totalText}>Total: ${item.total.toFixed(2)}</Text>
          {item.status === "Listo para pagar" && (
            <TouchableOpacity 
              style={styles.payButton}
              onPress={() => {
                setSelectedOrder(item);
                setPaymentModalVisible(true);
              }}
            >
              <Text style={styles.payButtonText}>Procesar Pago</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Botón de regreso al Home */}
      <TouchableOpacity style={styles.goBackButton} onPress={() => router.push('/(app)/home')}>
        <Text style={styles.goBackText}>← Regresar</Text>
      </TouchableOpacity>
      
      <Text style={styles.title}>Panel de Cajero</Text>
      
      {/* Filtro de estados */}
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Filtrar por estado:</Text>
        <Picker
          selectedValue={statusFilter}
          onValueChange={(itemValue) => setStatusFilter(itemValue)}
          style={styles.filterPicker}
        >
          <Picker.Item label="Todos" value="all" />
          <Picker.Item label="Listo para pagar" value="Listo para pagar" />
          <Picker.Item label="Entregado" value="Entregado" />
          <Picker.Item label="Listo para llevar a la mesa" value="Listo para llevar a la mesa" />
          <Picker.Item label="Hecho" value="Hecho" />
          <Picker.Item label="Cocinandose" value="Cocinandose" />
          <Picker.Item label="Ordenado" value="Ordenado" />
        </Picker>
      </View>
      
      {isLoading ? (
        <Text style={styles.loadingText}>Cargando órdenes...</Text>
      ) : filteredOrders.length === 0 ? (
        <Text style={styles.noOrdersText}>No hay órdenes disponibles</Text>
      ) : (
        <FlatList
          data={filteredOrders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={true}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Modal para procesar el pago */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={paymentModalVisible}
        onRequestClose={() => setPaymentModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirmar Pago</Text>
            
            {renderBillDetails()}
            
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setPaymentModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]}
                onPress={confirmPayment}
              >
                <Text style={styles.modalButtonText}>Confirmar Pago</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 40,
    color: colors.buttonText,
    alignSelf: 'center',
  },
  filterContainer: {
    marginBottom: 20,
    backgroundColor: colors.inputBackground,
    padding: 15,
    borderRadius: 10,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: colors.primary,
  },
  filterPicker: {
    height: 50,
    backgroundColor: colors.primary,
    color: colors.buttonText,
    borderRadius: 8,
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
  idRow: {
    flex: 1,
  },
  orderIdText: {
    fontSize: 14,
    color: '#555',
    fontStyle: 'italic',
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
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingTop: 10,
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  payButton: {
    backgroundColor: '#2A9D8F',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  payButtonText: {
    color: 'white',
    fontWeight: 'bold',
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: colors.background,
    width: '90%',
    maxHeight: '80%',
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: colors.primary,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: 'center',
    margin: 5,
  },
  cancelButton: {
    backgroundColor: '#E63946',
  },
  confirmButton: {
    backgroundColor: '#2A9D8F',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  billContainer: {
    marginTop: 10,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  billTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },
  billTableInfo: {
    fontSize: 14,
    marginBottom: 5,
    color: '#555',
  },
  billDateInfo: {
    fontSize: 14,
    marginBottom: 15,
    color: '#555',
  },
  billItemsHeader: {
    flexDirection: 'row',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    marginBottom: 8,
  },
  billItemText: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#444',
  },
  billItemRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  billItemDetailText: {
    fontSize: 14,
    color: '#666',
  },
  billSummary: {
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingTop: 15,
  },
  billTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  billTotalLabel: {
    fontSize: 15,
    color: '#555',
  },
  billTotalValue: {
    fontSize: 15,
    color: '#555',
    fontWeight: '500',
  },
  finalTotal: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  finalTotalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
});