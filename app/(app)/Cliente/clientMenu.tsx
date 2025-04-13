import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useDataContext } from '@/context/dataContext/DataContext';
import { useCartContext } from '@/context/cartContext/cartContext';
import { colors } from '@/constants/Colors';
import { useRouter } from 'expo-router'; // Para la navegación
import { MaterialIcons } from '@expo/vector-icons';  // Usamos MaterialIcons para el ícono del carrito

export default function ClientMenu() {
  const { menuItems } = useDataContext(); // Obtener los ítems del menú desde el contexto
  const { addItemToCart } = useCartContext(); // Obtener funciones de carrito desde el contexto
  const router = useRouter(); // Navegador para ir al carrito

  const addToCart = (item: any) => {
    addItemToCart({ ...item, quantity: 1 });
  };

  const renderItem = ({ item }: any) => (
    <View style={styles.itemContainer}>
      {/* Mostrar la imagen del producto */}
      <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemDescription}>{item.description}</Text>
        <Text style={styles.itemPrice}>${item.price}</Text>
      </View>
      <TouchableOpacity style={styles.button} onPress={() => addToCart(item)}>
        <Text style={styles.buttonText}>Añadir al Carrito</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Botón de carrito en la esquina superior derecha */}
      <TouchableOpacity style={styles.cartButton} onPress={() => router.push('/(app)/Cliente/clientCar')}>
        <MaterialIcons name="shopping-cart" size={30} color={colors.buttonText} />
      </TouchableOpacity>

      {/* Botón de regreso al Home */}
      <TouchableOpacity style={styles.goBackButton} onPress={() => router.push('/(app)/home')}>
        <Text style={styles.goBackText}>← Regresar</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Menú</Text>
      <FlatList
        data={menuItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id?.toString() || ''}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.background, // Usar color de fondo
  },
  itemContainer: {
    marginBottom: 20,
    backgroundColor: colors.inputBackground,  // Fondo de los items
    padding: 10,
    borderRadius: 8,
    flexDirection: 'row',  // Hacer que los ítems se muestren de manera horizontal
    alignItems: 'center',
  },
  itemImage: {
    width: 80,  // Ancho de la imagen
    height: 80,  // Alto de la imagen
    borderRadius: 8,  // Bordes redondeados para la imagen
    marginRight: 10,
  },
  itemDetails: {
    flex: 1,  // Ocupa el espacio restante
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.buttonText,  // Usar color del texto del botón
  },
  itemDescription: {
    fontSize: 14,
    color: colors.buttonText,  // Usar color del texto
    marginVertical: 5,
  },
  itemPrice: {
    fontSize: 16,
    color: colors.primary,  // Usar color primario para el precio
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: colors.primary,  // Usar el color primario para el botón
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: colors.buttonText,  // Usar color de texto del botón
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.buttonText,  // Título en el color del texto del botón
    marginBottom: 20,
    alignSelf: 'center',  // Centrar el título
  },
  cartButton: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  goBackButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    padding: 10,
  },
  goBackText: {
    fontSize: 18,
    color: colors.primary,  // Color para el texto de regreso
  },
});
