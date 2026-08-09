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
  async placeOrder(order: Order): Promise<string> {
    const docRef = await addDoc(ordersCollection, order);
    return docRef.id;
  },

  async getOrders(): Promise<Order[]> {
    const q = query(
      ordersCollection,
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((d) => ({
      ...(d.data() as Order),
      id: d.id,
    }));
  },

  subscribeToOrder(
    orderId: string,
    callback: (order: Order | null) => void
  ) {
    return onSnapshot(doc(db, "orders", orderId), (snapshot) => {
      if (!snapshot.exists()) {
        callback(null);
        return;
      }

      callback({
        ...(snapshot.data() as Order),
        id: snapshot.id,
      });
    });
  },
};