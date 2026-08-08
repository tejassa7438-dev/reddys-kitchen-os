export interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

export type OrderStatus =
  | "Pending"
  | "Preparing"
  | "Ready"
  | "Completed";

export interface Order {
  id: string;
  table: number;
  customerName: string;
  phone?: string;
  instructions?: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
}