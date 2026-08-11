export type OrderStatus =
  | "Pending"
  | "Preparing"
  | "Ready"
  | "Completed";


export type PaymentStatus =
  | "Unpaid"
  | "Paid";


export type PaymentMethod =
  | "Cash"
  | "UPI"
  | null;


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

  tableSessionId: string;

  customerUid: string;

  customerName: string;

  phone?: string;

  instructions?: string;

  items: OrderItem[];

  batches: OrderBatch[];

  total: number;

  status: OrderStatus;

  paymentStatus: PaymentStatus;

  paymentMethod: PaymentMethod;

  paidAt: string | null;

  createdAt: string;
}