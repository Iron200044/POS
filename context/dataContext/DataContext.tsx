import React, { createContext, useContext, useState, useEffect } from 'react';
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/utils/firebaseConfig';
import { supabase } from '@/utils/supabaseConfig';

// Define the interface for a menu item
export interface MenuItem {
  id?: string;
  name: string;
  description: string;
  price: string;
  imageUrl: string;
  createdAt?: Date;
}

// Define the context interface
interface DataContextValue {
  menuItems: MenuItem[];
  addMenuItem: (item: MenuItem) => Promise<void>;
  updateMenuItem: (id: string, item: Partial<MenuItem>) => Promise<void>;
  deleteMenuItem: (id: string) => Promise<void>;
  refreshMenu: () => Promise<void>;
  uploadImage: (uri: string) => Promise<string | null>;
}

// Create the context with default values
export const DataContext = createContext<DataContextValue>({
  menuItems: [],
  addMenuItem: async () => {},
  updateMenuItem: async () => {},
  deleteMenuItem: async () => {},
  refreshMenu: async () => {},
  uploadImage: async () => null,
});

// Context Provider
export const DataProvider = ({ children }: { children: React.ReactNode }) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const dbInstance = getFirestore();
  const menuCollection = collection(dbInstance, 'menuItems');

  // Function to refresh menu items
  const refreshMenu = async () => {
    try {
      const snapshot = await getDocs(menuCollection);
      const items: MenuItem[] = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as MenuItem[];
      setMenuItems(items);
    } catch (error: any) {
      console.error('Error refreshing menu:', error.message);
      throw error;
    }
  };
  // Load menu when context initializes
  useEffect(() => {
    refreshMenu();
  }, []);

  const uploadImage = async (uri: string): Promise<string | null> => {
    try {
      // Obtener el arrayBuffer de la imagen seleccionada
      const arrayBuffer = await fetch(uri).then(res => res.arrayBuffer());
      
      // Crear un nombre de archivo único con timestamp
      const originalFileName = uri.split('/').pop() ?? 'image.jpg';
      const timestamp = Date.now();
      const uniqueFileName = `${timestamp}-${originalFileName}`;
      
      console.log('Generando nombre único:', uniqueFileName);
      
      const blob = new Blob([arrayBuffer], { type: 'image/jpeg' });
    
      // Subir el archivo a Supabase con el nombre único
      const { data, error } = await supabase.storage
        .from('menuimgs')
        .upload(uniqueFileName, blob, {
          contentType: 'image/jpeg',
        });
    
      if (error) {
        console.error('Error uploading image to Supabase:', error.message);
        return null;
      }
    
      // Obtener la URL pública de la imagen subida
      const publicUrl = supabase.storage.from('menuimgs').getPublicUrl(data.path);
      console.log('Image uploaded successfully:', publicUrl.data.publicUrl);
    
      return publicUrl.data.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };
  
  // Function to add a new item
  const addMenuItem = async (item: MenuItem) => {
    try {
      await addDoc(menuCollection, {
        ...item,
        createdAt: new Date(),
      });
      await refreshMenu();
    } catch (error: any) {
      console.error('Error adding menu item:', error.message);
      throw error;
    }
  };

  // Function to update an existing item
  const updateMenuItem = async (id: string, item: Partial<MenuItem>) => {
    try {
      const itemRef = doc(dbInstance, 'menuItems', id);
      await updateDoc(itemRef, item);
      await refreshMenu();
    } catch (error: any) {
      console.error('Error updating menu item:', error.message);
      throw error;
    }
  };

  // Función para eliminar un ítem y su imagen asociada
  const deleteMenuItem = async (id: string) => {
    try {
      // Primero, obtener el ítem para encontrar la URL de la imagen
      const itemRef = doc(dbInstance, 'menuItems', id);
      const snapshot = await getDocs(menuCollection);
      const items = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as MenuItem[];
    
      const item = items.find(item => item.id === id);
    
      if (!item) {
        console.error('No se encontró el ítem a eliminar');
        return;
      }
    
      // Eliminar el ítem de Firestore
      await deleteDoc(itemRef);
    
      // Si el ítem tiene una imagen, eliminarla de Supabase
      if (item.imageUrl) {
        await deleteImage(item.imageUrl);
      }
    
      // Actualizar la lista de ítems
      await refreshMenu();
    } catch (error: any) {
      console.error('Error al eliminar ítem del menú:', error.message);
      throw error;
    }
  };

  // Función para eliminar una imagen de Supabase Storage
  const deleteImage = async (imageUrl: string): Promise<boolean> => {
    try {
      // Extraer el nombre del archivo del URL
      const fileName = imageUrl.split('/').pop();
    
      if (!fileName) {
        console.error('No se pudo extraer el nombre del archivo del URL');
        return false;
      }
    
      // Si el URL tiene parámetros de consulta, eliminarlos
      const cleanFileName = fileName.split('?')[0];
    
      // Eliminar el archivo de Supabase Storage
      const { error } = await supabase.storage
        .from('menuimgs')
        .remove([cleanFileName]);
    
      if (error) {
        console.error('Error al eliminar imagen de Supabase:', error.message);
        return false;
      }
    
      console.log('Imagen eliminada exitosamente:', cleanFileName);
      return true;
    } catch (error) {
      console.error('Error al eliminar imagen:', error);
      return false;
    }
  };

  return (
    <DataContext.Provider value={{ 
      menuItems, 
      addMenuItem, 
      updateMenuItem, 
      deleteMenuItem, 
      refreshMenu,
      uploadImage
    }}>
      {children}
    </DataContext.Provider>
  );
};

// Hook to use the menu context
export const useDataContext = () => useContext(DataContext);