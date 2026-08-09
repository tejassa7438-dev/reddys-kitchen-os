import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  doc,
  onSnapshot,
} from "firebase/firestore";

import { db } from "./firebase";
import type { Order } from "../types/order";

const ordersCollection = collection(db, "orders");

export const orderService = {
  // Place a new order
  async placeOrder(order: Order): Promise<string> {
    const docRef = await addDoc(ordersCollection, order);
    return docRef.id;
  },

  // Get all orders once
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

  // Live updates for all orders (Admin / Kitchen)
  subscribeToOrders(
    callback: (orders: Order[]) => void
  ) {
    const q = query(
      ordersCollection,
      orderBy("createdAt", "desc")
    );

    return onSnapshot(q, (snapshot) => {
      callback(
        snapshot.docs.map((doc) => ({
          ...(doc.data() as Order),
          id: doc.id,
        }))
      );
    });
  },

  // Live updates for a single order (Customer Tracking)
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
};