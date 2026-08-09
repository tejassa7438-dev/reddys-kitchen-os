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

import type {
  Order,
  OrderItem,
  OrderStatus,
} from "../types/order";

const ordersCollection = collection(db, "orders");
function mergeItems(
  existingItems: OrderItem[],
  newItems: OrderItem[]
): OrderItem[] {
  const merged = [...existingItems];

  newItems.forEach((newItem) => {
    const existing = merged.find(
      (item) => item.id === newItem.id
    );

    if (existing) {
      existing.quantity += newItem.quantity;
    } else {
      merged.push({ ...newItem });
    }
  });

  return merged;
}
export const orderService = {
// -----------------------------
// Place Order (Smart Table Merge)
// -----------------------------
async placeOrder(order: Order): Promise<string> {
  const snapshot = await getDocs(ordersCollection);

  const activeOrder = snapshot.docs
    .map((docSnap) => {
      const data = docSnap.data() as Order;

      return {
        ...data,
        id: docSnap.id,
      };
    })
    .find(
      (existingOrder) =>
        existingOrder.table === order.table &&
        existingOrder.status !== "Completed"
    );

  // -------------------------------------------------
  // Existing active order → add a NEW batch
  // -------------------------------------------------
  if (activeOrder) {
    const orderRef = doc(db, "orders", activeOrder.id);

    const newBatch = {
      id: `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 8)}`,
      items: order.items,
      status: "Pending" as const,
      createdAt: order.createdAt,
    };

    // Support old orders that were created before batches existed
    const existingBatches =
      activeOrder.batches?.length > 0
        ? activeOrder.batches
        : [
            {
              id: `${Date.now()}-legacy`,
              items: activeOrder.items,
              status: activeOrder.status,
              createdAt: activeOrder.createdAt,
            },
          ];

    const mergedItems = mergeItems(
  activeOrder.items,
  order.items
);

const total = mergedItems.reduce(
  (sum, item) =>
    sum + item.price * item.quantity,
  0
);

await updateDoc(orderRef, {
  items: mergedItems,
  batches: [...existingBatches, newBatch],
  total,
});

    return activeOrder.id;
  }

  // -------------------------------------------------
  // No active order → create completely new order
  // -------------------------------------------------
  const docRef = await addDoc(
    ordersCollection,
    order
  );

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