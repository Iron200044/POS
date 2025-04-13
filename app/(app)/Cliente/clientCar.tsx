import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';
import { useCartContext } from '@/context/cartContext/cartContext';
import { colors } from '@/constants/Colors';
import { useRouter } from 'expo-router';
import { useAuthContext } from '../../../context/authContext/AuthContext';

export default function ClientCart() {
  const { cartItems, updateItemQuantity, removeItemFromCart, createOrder } = useCartContext();
  const { mesa } = useAuthContext(); // Get mesa from AuthContext
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleQuantityChange = (id: string, quantity: number) => {
    if (quantity > 5) return;
    updateItemQuantity(id, quantity);
  };

  const handleRemoveItem = (id: string) => {
    removeItemFromCart(id);
  };

  const handleCheckout = async () => {
    if (!mesa) {
      Alert.alert('Error', 'No se ha especificado una mesa. Por favor escanea un código QR primero.');
      return;
    }

    setIsLoading(true);
    try {
      await createOrder();
      Alert.alert(
        'Orden creada',
        `Tu pedido ha sido realizado con éxito para la Mesa ${mesa}.`,
        [{ text: 'Ver mis órdenes', onPress: () => router.push('/(app)/Cliente/clientOrders') }]
      );
    } catch (error) {
      console.error('Error creating order:', error);
      Alert.alert('Error', 'No se pudo crear la orden. Por favor intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderCartItem = ({ item }: any) => (
    <View style={styles.cartItemContainer}>
      <Text style={styles.cartItemName}>{item.name}</Text>
      <Text style={styles.cartItemPrice}>${item.price}</Text>

      <View style={styles.quantityContainer}>
        <TouchableOpacity onPress={() => handleQuantityChange(item.id, item.quantity - 1)}>
          <Text style={styles.buttonText}>-</Text>
        </TouchableOpacity>
        <Text style={styles.cartItemQuantity}>{item.quantity}</Text>
        <TouchableOpacity onPress={() => handleQuantityChange(item.id, item.quantity + 1)}>
          <Text style={styles.buttonText}>+</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.removeButton} onPress={() => handleRemoveItem(item.id)}>
        <Text style={styles.removeButtonText}>Eliminar</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.goBackButton} onPress={() => router.push('/(app)/home')}>
        <Text style={styles.goBackText}>← Regresar</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Tu Carrito</Text>
      
      {mesa ? (
        <Text style={styles.mesaText}>Mesa: {mesa}</Text>
      ) : (
        <Text style={styles.mesaText}>No has seleccionado una mesa</Text>
      )}

      {isLoading ? (
        <Text style={styles.loadingText}>Creando orden...</Text>
      ) : (
        <FlatList
          data={cartItems}
          renderItem={renderCartItem}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={<Text style={styles.emptyCartText}>Tu carrito está vacío</Text>}
        />
      )}

      <TouchableOpacity 
        style={[styles.checkoutButton, (!cartItems.length || !mesa) && styles.disabledButton]} 
        onPress={handleCheckout} 
        disabled={isLoading || !cartItems.length || !mesa}
      >
        <Text style={styles.buttonText}>Confirmar Pedido</Text>
      </TouchableOpacity>
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
    marginBottom: 10,
    alignSelf: 'center',
  },
  mesaText: {
    fontSize: 18,
    color: colors.primary,
    marginBottom: 10,
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.buttonText,
    textAlign: 'center',
    marginVertical: 20,
  },
  emptyCartText: {
    fontSize: 16,
    color: colors.buttonText,
    textAlign: 'center',
    marginVertical: 20,
  },
  cartItemContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: colors.inputBackground,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  cartItemName: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.buttonText,
  },
  cartItemPrice: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: 'bold',
    paddingHorizontal: 10,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartItemQuantity: {
    fontSize: 16,
    marginHorizontal: 10,
    color: colors.buttonText,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.buttonText,
  },
  removeButton: {
    marginLeft: 10,
    backgroundColor: colors.error,
    padding: 10,
    borderRadius: 8,
  },
  removeButtonText: {
    color: colors.buttonText,
    fontWeight: 'bold',
  },
  checkoutButton: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: colors.secondary,
    opacity: 0.7,
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