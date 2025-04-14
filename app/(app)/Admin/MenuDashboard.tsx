import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useDataContext } from '@/context/dataContext/DataContext';
import { colors } from '@/constants/Colors';

export default function MenuDashboard() {
  const { menuItems, deleteMenuItem, refreshMenu } = useDataContext();
  const [loading, setLoading] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const router = useRouter();

  // Refrescar el menú al iniciar la pantalla
  useEffect(() => {
    refreshMenu();
  }, [refreshMenu]);

  const handleDelete = async (id: string) => {
    try {
      await deleteMenuItem(id);
      Alert.alert('Ítem eliminado', 'El ítem ha sido eliminado del menú');
    } catch (error) {
      console.error('Error al eliminar el ítem:', error);
      Alert.alert('Error', 'Hubo un problema al eliminar el ítem');
    }
  };

  const handleEdit = (id: string) => {
    // Usar la forma correcta para pasar parámetros con expo-router
    router.push({
      pathname: '/(app)/Admin/MenuCRUD',
      params: { id }
    });
  };

  const toggleDescription = (id: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const renderItem = ({ item }: any) => {
    const isExpanded = expandedItems[item.id!] || false;

    return (
      <View style={styles.itemContainer}>
        {/* Primera fila: Imagen y detalles principales */}
        <View style={styles.itemTopRow}>
          <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
          <View style={styles.itemMainDetails}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemPrice}>${item.price}</Text>
          </View>
        </View>

        {/* Segunda fila: Descripción (expandible) */}
        {isExpanded && (
          <View style={styles.descriptionContainer}>
            <Text style={styles.itemDescription}>{item.description}</Text>
          </View>
        )}

        {/* Tercera fila: Botones de acción */}
        <View style={styles.itemActionsRow}>
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => toggleDescription(item.id!)}
          >
            <Text style={styles.toggleButtonText}>
              {isExpanded ? 'Menos' : 'Más'}
            </Text>
          </TouchableOpacity>

          <View style={styles.itemActions}>
            <TouchableOpacity
              style={[styles.button, styles.editButton]}
              onPress={() => handleEdit(item.id!)}
            >
              <Text style={styles.buttonText}>Editar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.deleteButton]}
              onPress={() => handleDelete(item.id!)}
            >
              <Text style={styles.buttonText}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Botón de regreso al Home */}
      <TouchableOpacity style={styles.goBackButton} onPress={() => router.push('/(app)/home')}>
          <Text style={styles.goBackText}>← Regresar</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Menú de Items</Text>

      {loading ? (
        <Text>Cargando...</Text>
      ) : (
        <FlatList
          data={menuItems}
          renderItem={renderItem}
          keyExtractor={(item) => item.id!}
        />
      )}

      <TouchableOpacity style={styles.addButton} onPress={() => router.push('/(app)/Admin/MenuCRUD')}>
        <Text style={styles.buttonText}>Añadir Nuevo Item</Text>
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
    color: colors.buttonText,
    fontWeight: 'bold',
    marginBottom: 20,
    alignSelf: 'center',
  },
  itemContainer: {
    flexDirection: 'column',
    marginBottom: 20,
    padding: 12,
    backgroundColor: colors.inputBackground,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  itemTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginRight: 12,
  },
  itemMainDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 18,
    color: colors.buttonText,
    fontWeight: 'bold',
  },
  itemPrice: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: 'bold',
    marginTop: 4,
  },
  descriptionContainer: {
    marginTop: 10,
    marginBottom: 10,
    paddingHorizontal: 4,
    paddingVertical: 8,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 6,
  },
  itemDescription: {
    fontSize: 14,
    color: colors.buttonText,
  },
  itemActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  toggleButton: {
    backgroundColor: colors.secondary || '#555',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  toggleButtonText: {
    color: colors.buttonText,
    fontWeight: '500',
    fontSize: 14,
  },
  itemActions: {
    flexDirection: 'row',
  },
  button: {
    padding: 8,
    borderRadius: 5,
    marginLeft: 8,
    width: 75,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: colors.primary,
  },
  deleteButton: {
    backgroundColor: colors.error,
  },
  buttonText: {
    color: colors.buttonText,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
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