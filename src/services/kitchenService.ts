import { doc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";
import type { OrderStatus } from "../types/order";

export const kitchenService = {
  async updateStatus(orderId: string, status: OrderStatus) {
    await updateDoc(doc(db, "orders", orderId), {
      status,
    });
  },
};