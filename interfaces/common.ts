import { Timestamp } from 'firebase/firestore';

export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

export interface PaidOrder {
  id: string;
  items: OrderItem[];
  total: number;
  paidAt: Timestamp; // Usamos el tipo Timestamp de Firebase explícitamente
  createdAt: Timestamp;
  tableNumber: string;
  originalOrderId: string;
}
export interface Order {
    id: string;
    status: string;
    items: OrderItem[];
    total: number;
    createdAt: any;
    tableNumber: string;
}

