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
    console.log("Writing to Firestore...");

    const docRef = await addDoc(ordersCollection, order);

    console.log("Firestore write successful:", docRef.id);
  },

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
};