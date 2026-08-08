import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";

import { db } from "./firebase";
import type { Order } from "../types/order";

const ordersCollection = collection(db, "orders");

export const orderService = {
  async placeOrder(order: Order): Promise<void> {
    await addDoc(ordersCollection, order);
  },

  async getOrders(): Promise<Order[]> {
    const q = query(ordersCollection, orderBy("createdAt", "desc"));

    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      ...(doc.data() as Order),
      id: doc.id,
    }));
  },
};