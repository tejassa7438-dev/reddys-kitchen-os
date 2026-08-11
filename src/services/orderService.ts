import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  updateDoc,
  where,
} from "firebase/firestore";

import {
  db,
  customerDb,
} from "./firebase";

import type {
  Order,
  OrderItem,
  OrderStatus,
  PaymentMethod,
} from "../types/order";


// =========================================
// STAFF ORDERS COLLECTION
// =========================================

const ordersCollection =
  collection(
    db,
    "orders"
  );


// =========================================
// CUSTOMER ORDERS COLLECTION
// =========================================

const customerOrdersCollection =
  collection(
    customerDb,
    "orders"
  );


// =========================================
// MERGE ORDER ITEMS
// =========================================

function mergeOrderItems(
  existingItems: OrderItem[],
  newItems: OrderItem[]
): OrderItem[] {

  const merged =
    existingItems.map(
      (item) => ({
        ...item,
      })
    );


  for (
    const newItem of newItems
  ) {

    const existingIndex =
      merged.findIndex(
        (item) =>
          String(item.id) ===
          String(newItem.id)
      );


    if (
      existingIndex !== -1
    ) {

      merged[
        existingIndex
      ] = {

        ...merged[
          existingIndex
        ],

        quantity:
          merged[
            existingIndex
          ].quantity +
          newItem.quantity,

      };

    } else {

      merged.push({
        ...newItem,
      });

    }

  }


  return merged;
}


// =========================================
// CREATE CUSTOMER ORDER
// =========================================

async function createOrder(
  order: Order
): Promise<string> {

  const orderData = {

    table:
      order.table,

    tableSessionId:
      order.tableSessionId,

    customerUid:
      order.customerUid,

    customerName:
      order.customerName,

    phone:
      order.phone,

    instructions:
      order.instructions,

    items:
      order.items,

    batches:
      order.batches,

    total:
      order.total,

    status:
      order.status,

    paymentStatus:
      order.paymentStatus,

    paymentMethod:
      order.paymentMethod,

    paidAt:
      order.paidAt,

    createdAt:
      order.createdAt,

  };


  const created =
    await addDoc(
      customerOrdersCollection,
      orderData
    );


  return created.id;
}


// =========================================
// ORDER SERVICE
// =========================================

export const orderService = {


  // =======================================
  // CREATE ORDER
  // =======================================

  async createOrder(
    order: Order
  ): Promise<string> {

    return createOrder(
      order
    );

  },


  // =======================================
  // PLACE ORDER
  // =======================================
  //
  // No existing active order:
  //     Create a new order.
  //
  // Existing active order:
  //     Add a new batch to that order.
  //
  // Completed order:
  //     Create a new order.
  //
  // =======================================

  async placeOrder(
    order: Order
  ): Promise<string> {

    const storageKey =
      `activeOrderId_table_${order.table}`;


    const existingOrderId =
      localStorage.getItem(
        storageKey
      );


    // =====================================
    // NO EXISTING ACTIVE ORDER
    // =====================================

    if (
      !existingOrderId
    ) {

      const newOrderId =
        await createOrder(
          order
        );


      localStorage.setItem(
        storageKey,
        newOrderId
      );


      localStorage.setItem(
        "activeOrderId",
        newOrderId
      );


      return newOrderId;

    }


    // =====================================
    // EXISTING ORDER
    // =====================================

    const existingOrderRef =
      doc(
        customerDb,
        "orders",
        existingOrderId
      );


    try {

      await runTransaction(
        customerDb,
        async (
          transaction
        ) => {

          const snapshot =
            await transaction.get(
              existingOrderRef
            );


          // ---------------------------------
          // ORDER DOES NOT EXIST
          // ---------------------------------

          if (
            !snapshot.exists()
          ) {

            throw new Error(
              "EXISTING_ORDER_NOT_FOUND"
            );

          }


          const existingOrder =
            {
              ...(snapshot.data() as Order),

              id:
                snapshot.id,
            };


          // ---------------------------------
          // CUSTOMER OWNERSHIP
          // ---------------------------------

          if (
            existingOrder.customerUid !==
            order.customerUid
          ) {

            throw new Error(
              "ORDER_OWNER_MISMATCH"
            );

          }


          // ---------------------------------
          // SAME TABLE SESSION
          // ---------------------------------

          if (
            existingOrder.tableSessionId !==
            order.tableSessionId
          ) {

            throw new Error(
              "TABLE_SESSION_MISMATCH"
            );

          }


          // ---------------------------------
          // COMPLETED ORDER
          // ---------------------------------

          if (
            existingOrder.status ===
            "Completed"
          ) {

            throw new Error(
              "ORDER_ALREADY_COMPLETED"
            );

          }


          // ---------------------------------
          // EXISTING BATCHES
          // ---------------------------------

          const existingBatches =
            Array.isArray(
              existingOrder.batches
            )
              ? existingOrder.batches
              : [];


          // ---------------------------------
          // NEW BATCH NUMBER
          // ---------------------------------

          const newBatchNumber =
            existingBatches.length +
            1;


          // ---------------------------------
          // NEW BATCH
          // ---------------------------------

          const newBatch = {

            id:
              `${Date.now()}-batch-${newBatchNumber}`,

            items:
              order.items,

            status:
              "Pending" as const,

            createdAt:
              new Date()
                .toISOString(),

          };


          // ---------------------------------
          // ADD NEW BATCH
          // ---------------------------------

          const updatedBatches = [

            ...existingBatches,

            newBatch,

          ];


          // ---------------------------------
          // MERGE TOP-LEVEL ITEMS
          // ---------------------------------

          const existingItems =
            Array.isArray(
              existingOrder.items
            )
              ? existingOrder.items
              : [];


          const updatedItems =
            mergeOrderItems(
              existingItems,
              order.items
            );


          // ---------------------------------
          // UPDATE TOTAL
          // ---------------------------------

          const updatedTotal =
            Number(
              existingOrder.total
            ) +
            Number(
              order.total
            );


          // ---------------------------------
          // UPDATE EXISTING ORDER
          // ---------------------------------

          transaction.update(
            existingOrderRef,
            {

              items:
                updatedItems,

              batches:
                updatedBatches,

              total:
                updatedTotal,

              status:
                "Pending",

              paymentStatus:
                "Unpaid",

              paymentMethod:
                null,

              paidAt:
                null,

              customerName:
                order.customerName,

              phone:
                order.phone,

              instructions:
                order.instructions,

            }
          );

        }
      );


      // =====================================
      // SUCCESS
      // =====================================

      localStorage.setItem(
        storageKey,
        existingOrderId
      );


      localStorage.setItem(
        "activeOrderId",
        existingOrderId
      );


      return existingOrderId;


    } catch (
      error
    ) {

      // =====================================
      // EXISTING ORDER MISSING / COMPLETED
      // =====================================

      if (
        error instanceof Error &&
        (
          error.message ===
            "ORDER_ALREADY_COMPLETED" ||

          error.message ===
            "EXISTING_ORDER_NOT_FOUND"
        )
      ) {

        localStorage.removeItem(
          storageKey
        );


        if (
          localStorage.getItem(
            "activeOrderId"
          ) ===
          existingOrderId
        ) {

          localStorage.removeItem(
            "activeOrderId"
          );

        }


        const newOrderId =
          await createOrder(
            order
          );


        localStorage.setItem(
          storageKey,
          newOrderId
        );


        localStorage.setItem(
          "activeOrderId",
          newOrderId
        );


        return newOrderId;

      }


      throw error;

    }

  },


  // =======================================
  // CUSTOMER: SUBSCRIBE TO ONE ORDER
  // =======================================
  //
  // Used by the customer Menu/Tracking pages.
  //
  // Uses customerDb.
  //
  // =======================================

  subscribeToOrder(
    orderId: string,
    callback: (
      order: Order | null
    ) => void
  ) {

    const orderRef =
      doc(
        customerDb,
        "orders",
        orderId
      );


    return onSnapshot(
      orderRef,

      (snapshot) => {

        if (
          !snapshot.exists()
        ) {

          callback(
            null
          );

          return;

        }


        callback({

          ...(snapshot.data() as Order),

          id:
            snapshot.id,

        });

      },

      (error) => {

        console.error(
          "Customer order subscription error:",
          error
        );


        callback(
          null
        );

      }
    );

  },


  // =======================================
  // STAFF: SUBSCRIBE TO ALL ORDERS
  // =======================================
  //
  // Kitchen/Admin only.
  //
  // Uses staff db.
  //
  // =======================================

  subscribeToOrders(
    callback: (
      orders: Order[]
    ) => void
  ) {

    const ordersQuery =
      query(
        ordersCollection,

        orderBy(
          "createdAt",
          "desc"
        )
      );


    return onSnapshot(
      ordersQuery,

      (snapshot) => {

        const orders =
          snapshot.docs.map(
            (snapshotDoc) => ({

              ...(snapshotDoc.data() as Order),

              id:
                snapshotDoc.id,

            })
          );


        callback(
          orders
        );

      },

      (error) => {

        console.error(
          "Staff orders subscription error:",
          error
        );


        callback(
          []
        );

      }
    );

  },


  // =======================================
  // STAFF: UPDATE ORDER STATUS
  // =======================================

  async updateOrderStatus(
    orderId: string,
    status: OrderStatus
  ) {

    const orderRef =
      doc(
        db,
        "orders",
        orderId
      );


    await updateDoc(
      orderRef,
      {
        status,
      }
    );

  },


  // =======================================
  // STAFF: MARK ORDER PAID
  // =======================================

  async markOrderPaid(
    orderId: string,
    method: PaymentMethod
  ) {

    const orderRef =
      doc(
        db,
        "orders",
        orderId
      );


    const paidAt =
      new Date()
        .toISOString();


    await updateDoc(
      orderRef,
      {

        paymentStatus:
          "Paid",

        paymentMethod:
          method,

        paidAt,

      }
    );

  },


  // =======================================
  // STAFF: MARK ORDER UNPAID
  // =======================================

  async markOrderUnpaid(
    orderId: string
  ) {

    const orderRef =
      doc(
        db,
        "orders",
        orderId
      );


    await updateDoc(
      orderRef,
      {

        paymentStatus:
          "Unpaid",

        paymentMethod:
          null,

        paidAt:
          null,

      }
    );

  },


  // =======================================
  // STAFF: CLEAR TABLE
  // =======================================

  async clearTable(
    tableNumber: number
  ) {

    const tableQuery =
      query(
        ordersCollection,

        where(
          "table",
          "==",
          tableNumber
        )
      );


    const snapshot =
      await getDocs(
        tableQuery
      );


    if (
      snapshot.empty
    ) {

      throw new Error(
        `No order found for Table ${tableNumber}.`
      );

    }


    // ---------------------------------------
    // Find latest active order
    // ---------------------------------------

    const activeOrders =
      snapshot.docs

        .map(
          (snapshotDoc) => ({

            ...(snapshotDoc.data() as Order),

            id:
              snapshotDoc.id,

          })
        )

        .filter(
          (order) =>
            order.status !==
            "Completed"
        )

        .sort(
          (a, b) =>
            new Date(
              b.createdAt
            ).getTime() -
            new Date(
              a.createdAt
            ).getTime()
        );


    if (
      activeOrders.length === 0
    ) {

      throw new Error(
        `Table ${tableNumber} has no active order.`
      );

    }


    const order =
      activeOrders[0];


    // ---------------------------------------
    // Payment required
    // ---------------------------------------

    if (
      order.paymentStatus !==
      "Paid"
    ) {

      throw new Error(
        "Payment must be completed before clearing the table."
      );

    }


    // ---------------------------------------
    // Complete order
    // ---------------------------------------

    const orderRef =
      doc(
        db,
        "orders",
        order.id
      );


    await updateDoc(
      orderRef,
      {

        status:
          "Completed",

      }
    );


    // ---------------------------------------
    // Clear local active order
    // ---------------------------------------

    const storageKey =
      `activeOrderId_table_${tableNumber}`;


    localStorage.removeItem(
      storageKey
    );


    const activeOrderId =
      localStorage.getItem(
        "activeOrderId"
      );


    if (
      activeOrderId ===
      order.id
    ) {

      localStorage.removeItem(
        "activeOrderId"
      );

    }

  },


  // =======================================
  // STAFF: DELETE ORDER
  // =======================================

  async deleteOrder(
    orderId: string
  ) {

    const orderRef =
      doc(
        db,
        "orders",
        orderId
      );


    await deleteDoc(
      orderRef
    );

  },


  // =======================================
  // LEGACY STATUS METHOD
  // =======================================

  async updateStatus(
    orderId: string,
    status: OrderStatus
  ) {

    await this.updateOrderStatus(
      orderId,
      status
    );

  },

};