import {
  doc,
  getDoc,
  runTransaction,
} from "firebase/firestore";

import { db } from "./firebase";

import type {
  Order,
  OrderStatus,
} from "../types/order";

export const kitchenService = {
  // -----------------------------------------
  // Update Individual Kitchen Batch
  // -----------------------------------------
  async updateBatchStatus(
    orderId: string,
    batchId: string,
    status: OrderStatus
  ) {
    const orderRef = doc(db, "orders", orderId);

    await runTransaction(db, async (transaction) => {
      const snapshot = await transaction.get(orderRef);

      if (!snapshot.exists()) {
        throw new Error("Order not found.");
      }

      const order = {
        ...(snapshot.data() as Order),
        id: snapshot.id,
      };

      if (!order.batches || order.batches.length === 0) {
        throw new Error("This order has no kitchen batches.");
      }

      const updatedBatches = order.batches.map((batch) =>
        batch.id === batchId
          ? {
              ...batch,
              status,
            }
          : batch
      );

      const updatedBatch = updatedBatches.find(
        (batch) => batch.id === batchId
      );

      if (!updatedBatch) {
        throw new Error("Kitchen batch not found.");
      }

      // -----------------------------------------
      // Calculate overall order status
      // -----------------------------------------
      let overallStatus: OrderStatus = "Completed";

      if (
        updatedBatches.some(
          (batch) => batch.status === "Pending"
        )
      ) {
        overallStatus = "Pending";
      } else if (
        updatedBatches.some(
          (batch) => batch.status === "Preparing"
        )
      ) {
        overallStatus = "Preparing";
      } else if (
        updatedBatches.some(
          (batch) => batch.status === "Ready"
        )
      ) {
        overallStatus = "Ready";
      }

      transaction.update(orderRef, {
        batches: updatedBatches,
        status: overallStatus,
      });
    });
  },

  // -----------------------------------------
  // Legacy Order Status Update
  // -----------------------------------------
  async updateStatus(
    orderId: string,
    status: OrderStatus
  ) {
    const orderRef = doc(db, "orders", orderId);

    const snapshot = await getDoc(orderRef);

    if (!snapshot.exists()) {
      throw new Error("Order not found.");
    }

    await runTransaction(db, async (transaction) => {
      const freshSnapshot = await transaction.get(orderRef);

      if (!freshSnapshot.exists()) {
        throw new Error("Order not found.");
      }

      transaction.update(orderRef, {
        status,
      });
    });
  },
};