import React, { createContext, useContext, useState } from 'react';
import { getFirestore, collection, addDoc, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from '@/utils/firebaseConfig'; // Firestore config
import { useAuthContext } from '@/context/authContext/AuthContext';

interface CartItem {
  id: string;
  name: string;
  price: string;
  quantity: number;
  imageUrl: string;
}

interface CartContextValue {
  cartItems: CartItem[];
  addItemToCart: (item: CartItem) => void;
  removeItemFromCart: (id: string) => void;
  updateItemQuantity: (id: string, quantity: number) => void;
  createOrder: () => Promise<string>;  // Function to create the order in Firestore
  updateOrderStatus: (orderId: string, status: string) => Promise<void>;  // Update order status
  moveOrderToPagados: (orderId: string) => Promise<void>;
}

const CartContext = createContext<CartContextValue>({
  cartItems: [],
  addItemToCart: () => {},
  removeItemFromCart: () => {},
  updateItemQuantity: () => {},
  createOrder: async () => {return ""; },
  updateOrderStatus: async () => {},
  moveOrderToPagados: async () => {},
});

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, mesa } = useAuthContext(); // Get both user and mesa from AuthContext
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const addItemToCart = (item: CartItem) => {
    setCartItems((prevItems) => [...prevItems, item]);
  };

  const removeItemFromCart = (id: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const updateItemQuantity = (id: string, quantity: number) => {
    setCartItems((prevItems) => 
      prevItems.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, Math.min(5, quantity)) } : item
      )
    );
  };

  const createOrder = async () => {
    try {
      if (cartItems.length === 0 || !user) {
        console.log('The cart is empty or user is not authenticated');
        throw new Error('The cart is empty or user is not authenticated');
      }

      // Check if mesa (table number) is available
      if (!mesa) {
        console.log('No table number specified');
        throw new Error('No table number specified');
      }

      const total = cartItems.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);

      // Creating a new order in Firestore with tableNumber
      const newOrder = {
        userId: user.uid,
        items: cartItems,
        status: 'Ordenado',
        total,
        tableNumber: mesa, // Include the mesa (table number) in the order
        createdAt: new Date(),
      };

      // Save the order in Firestore
      const orderRef = await addDoc(collection(db, 'orders'), newOrder);
      console.log('Order created successfully with ID:', orderRef.id);
      
      setCartItems([]); // Clear the cart after the order is created
      return orderRef.id; // Return the order ID in case it's needed

    } catch (error) {
      console.error('Error creating order:', error);
      throw error; // Re-throw the error so it can be caught by the component
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        status: status,
        updatedAt: new Date(),
      });
      console.log(`Order ${orderId} status updated to ${status}`);
      
      // If the status is changed to "Pagado", move the order to the 'pagados' collection
      if (status === "Pagado") {
        await moveOrderToPagados(orderId);
      }
    } catch (error) {
      console.error("Error updating status: ", error);
      throw error;
    }
  };

  //Mover ordenes de orders a pagados
  // Function to move orders from 'orders' to 'pagados' collection
  const moveOrderToPagados = async (orderId: string) => {
    try {
      // 1. Get the order document from 'orders' collection
      const orderRef = doc(db, 'orders', orderId);
      const orderSnapshot = await getDoc(orderRef);
    
      if (!orderSnapshot.exists()) {
        console.error(`Order with ID ${orderId} does not exist`);
        return;
      }
    
      const orderData = orderSnapshot.data();
    
      // 2. Add the order to the 'pagados' collection
      // We use the same ID to maintain consistency
      await addDoc(collection(db, 'pagados'), {
        ...orderData,
        paidAt: new Date(), // Add a timestamp for when it was paid
        originalOrderId: orderId // Keep reference to the original order ID
      });
    
      console.log(`Order ${orderId} moved to 'pagados' collection`);
    
      // 3. Delete the order from the original 'orders' collection
      await deleteDoc(orderRef);
      console.log(`Order ${orderId} deleted from 'orders' collection`);
    
    } catch (error) {
      console.error("Error moving order to pagados: ", error);
      throw error;
    }
  };


  

  return (
    <CartContext.Provider value={{ cartItems, addItemToCart, removeItemFromCart, updateItemQuantity, createOrder, updateOrderStatus, moveOrderToPagados }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCartContext = () => useContext(CartContext);