import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  doc,
  onSnapshot,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

import { db } from "./firebase";

import type { Order, OrderStatus } from "../types/order";

const ordersCollection = collection(db, "orders");

export const orderService = {
  // -----------------------------
  // Place New Order
  // -----------------------------
  async placeOrder(order: Order): Promise<string> {
    const docRef = await addDoc(ordersCollection, order);
    return docRef.id;
  },

  // -----------------------------
  // Get All Orders (One Time)
  // -----------------------------
  async getOrders(): Promise<Order[]> {
    const q = query(
      ordersCollection,
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      ...(doc.data() as Order),
      id: doc.id,
    }));
  },

  // -----------------------------
  // Live Orders (Admin/Kitchen)
  // -----------------------------
  subscribeToOrders(
    callback: (orders: Order[]) => void
  ) {
    const q = query(
      ordersCollection,
      orderBy("createdAt", "desc")
    );

    return onSnapshot(q, (snapshot) => {
      const orders = snapshot.docs.map((doc) => ({
        ...(doc.data() as Order),
        id: doc.id,
      }));

      callback(orders);
    });
  },

  // -----------------------------
  // Live Single Order (Tracking)
  // -----------------------------
  subscribeToOrder(
    orderId: string,
    callback: (order: Order | null) => void
  ) {
    return onSnapshot(
      doc(db, "orders", orderId),
      (snapshot) => {
        if (!snapshot.exists()) {
          callback(null);
          return;
        }

        callback({
          ...(snapshot.data() as Order),
          id: snapshot.id,
        });
      }
    );
  },

  // -----------------------------
  // Update Order Status
  // -----------------------------
  async updateOrderStatus(
    orderId: string,
    status: OrderStatus
  ): Promise<void> {
    const orderRef = doc(db, "orders", orderId);

    await updateDoc(orderRef, {
      status,
    });
  },

  // -----------------------------
  // Delete Order (Optional)
  // -----------------------------
  async deleteOrder(orderId: string): Promise<void> {
    await deleteDoc(doc(db, "orders", orderId));
  },
};