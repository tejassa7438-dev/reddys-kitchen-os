export type OrderStatus =
  | "Pending"
  | "Preparing"
  | "Ready"
  | "Completed";

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface OrderBatch {
  id: string;
  items: OrderItem[];
  status: OrderStatus;
  createdAt: string;
}

export interface Order {
  id: string;
  table: number;
  customerName: string;
  phone?: string;
  instructions?: string;

  // All items across the table's active order.
  // Used for billing, admin and tracking.
  items: OrderItem[];

  // Individual kitchen rounds.
  batches: OrderBatch[];

  total: number;

  // Overall order status.
  status: OrderStatus;

  createdAt: string;
}