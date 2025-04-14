import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, ActivityIndicator } from 'react-native';
import CameraModal from '@/components/camaraModalAdmin';
import { colors } from '@/constants/Colors';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useDataContext, MenuItem } from '@/context/dataContext/DataContext';

export default function MenuCRUD() {
  const [image, setImage] = useState<string | undefined>(undefined);
  const [itemName, setItemName] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [itemPrice, setPrice] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [itemId, setItemId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
   // Uri temporal de la imagen seleccionada (local)
   const [localImageUri, setLocalImageUri] = useState<string | undefined>(undefined);
   // URL de la imagen almacenada (solo se usa para mostrar imágenes existentes)
   const [storedImageUrl, setStoredImageUrl] = useState<string | undefined>(undefined);
  
  const router = useRouter();
  const params = useLocalSearchParams();
  const { menuItems, addMenuItem, updateMenuItem, uploadImage } = useDataContext();

  const isEditing = itemId !== null;

  useEffect(() => {
    const id = params.id as string;
    if (id) {
      setItemId(id);
      const item = menuItems.find(item => item.id === id);
      if (item) {
        setItemName(item.name);
        setItemDescription(item.description);
        setPrice(item.price);
        setStoredImageUrl(item.imageUrl); // Guardamos la URL de la imagen existente
      } else {
        Alert.alert('Error', 'El ítem no existe.');
      }
    }
  }, [params.id, menuItems]);

  const handleAddOrUpdateItem = async () => {
    if (!itemName || !itemDescription || !localImageUri) { // Usamos la URI local para verificar si se seleccionó una imagen
      Alert.alert('Error', 'Por favor, complete todos los campos.');
      return;
    }

    setIsLoading(true);

    try {
      // Si la imagen fue seleccionada, la subimos a Supabase
      const uploadedImageUrl = await uploadImage(localImageUri); // Subir solo cuando se añada el ítem
      console.log('Upload result:', uploadedImageUrl);
      
      const menuItem: MenuItem = {
        name: itemName,
        description: itemDescription,
        price: itemPrice,
        imageUrl: uploadedImageUrl || '',  // Usamos la URL de Supabase
      };

      if (isEditing && itemId) {
        // Update existing item
        await updateMenuItem(itemId, menuItem);
        Alert.alert('Éxito', `${itemName} se ha actualizado correctamente.`);
      } else {
        // Create new item
        await addMenuItem(menuItem);
        Alert.alert('Éxito', `${itemName} se ha agregado correctamente al menú.`);
      }

      // Clear fields and navigate back
      setItemName('');
      setItemDescription('');
      setPrice('');
      setImage(undefined);
      setLocalImageUri(undefined); // Clear local image URI
      router.push('/(app)/Admin/MenuDashboard');
    } catch (error) {
      console.error('Error saving menu item:', error);
      Alert.alert('Error', 'Hubo un problema al guardar el ítem.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageSelected = (uri: string) => {
    // Solo guardamos la URI local, no subimos la imagen todavía
    setLocalImageUri(uri);
    setIsVisible(false);
  };
  

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.goBackButton} onPress={() => router.back()}>
        <Text style={styles.goBackText}>← Regresar</Text>
      </TouchableOpacity>

      <Text style={styles.title}>{isEditing ? 'Editar Item del Menú' : 'Añadir Item al Menú'}</Text>

      <TextInput
        style={styles.input}
        placeholder="Nombre del item"
        value={itemName}
        onChangeText={setItemName}
      />
      <TextInput
        style={styles.input}
        placeholder="Descripción del item"
        value={itemDescription}
        onChangeText={setItemDescription}
      />
      <TextInput
        style={styles.input}
        placeholder="Precio del item"
        keyboardType="number-pad"
        value={itemPrice}
        onChangeText={setPrice}
      />

      <Text style={styles.label}>Imagen del Item</Text>
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => setIsVisible(true)}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>Seleccionar Imagen</Text>
      </TouchableOpacity>

      {localImageUri && (
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: localImageUri }} 
            style={styles.imagePreview} 
            onError={() => console.error('Error loading image')}
          />
          {isLoading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          )}
        </View>
      )}

      <TouchableOpacity 
        style={[styles.button, isLoading && styles.disabledButton]} 
        onPress={handleAddOrUpdateItem}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Procesando...' : isEditing ? 'Actualizar Item' : 'Añadir Item'}
        </Text>
      </TouchableOpacity>

      {/* Camera modal for selecting images */}
      <CameraModal
        isVisible={isVisible}
        onClose={() => setIsVisible(false)}
        onImageSelected={handleImageSelected}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 28,
    color: colors.buttonText,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    alignSelf: 'flex-start',
    marginLeft: '10%',
    marginBottom: 5,
    color: colors.buttonText,
  },
  input: {
    backgroundColor: colors.inputBackground,
    color: colors.buttonText,
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16, 
    borderWidth: 1,
    borderColor: colors.primary,
    width: '80%',
  },
  button: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
    width: '80%',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: colors.primary + '80', // Add transparency to indicate disabled
  },
  buttonText: {
    color: colors.buttonText,
    fontSize: 16,
    fontWeight: 'bold',
  },
  imageContainer: {
    position: 'relative',
    marginVertical: 10,
  },
  imagePreview: {
    width: 150,
    height: 150,
    borderRadius: 8,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
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
