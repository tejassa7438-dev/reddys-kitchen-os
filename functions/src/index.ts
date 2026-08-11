import { setGlobalOptions } from "firebase-functions";

import {
  onCall,
  HttpsError,
} from "firebase-functions/v2/https";

import {
  initializeApp,
} from "firebase-admin/app";

import {
  getFirestore,
  FieldValue,
} from "firebase-admin/firestore";

import * as logger from "firebase-functions/logger";


// =========================================
// FIREBASE CONFIG
// =========================================

setGlobalOptions({
  maxInstances: 10,
});

initializeApp();

const db = getFirestore();

const ordersCollection =
  db.collection("orders");


// =========================================
// TYPES
// =========================================

type OrderStatus =
  | "Pending"
  | "Preparing"
  | "Ready"
  | "Completed";


interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}


interface OrderBatch {
  id: string;
  items: OrderItem[];
  status: OrderStatus;
  createdAt: string;
}


interface IncomingOrder {
  id?: string;

  table: number;

  customerName: string;

  phone?: string;

  instructions?: string;

  items: OrderItem[];

  batches: OrderBatch[];

  total: number;

  status: OrderStatus;

  createdAt: string;

  paymentStatus?:
    | "Paid"
    | "Unpaid";

  paymentMethod?: string | null;

  paidAt?: string | null;
}


interface StoredOrder
  extends IncomingOrder {
  customerUid?: string;
  tableSessionId?: string;
}


// =========================================
// VALIDATE ORDER
// =========================================

function validateOrder(
  order: IncomingOrder
): void {

  if (
    !Number.isInteger(
      order.table
    ) ||
    order.table < 1 ||
    order.table > 12
  ) {
    throw new HttpsError(
      "invalid-argument",
      "Invalid table number."
    );
  }


  if (
    !order.customerName ||
    typeof order.customerName !==
      "string"
  ) {
    throw new HttpsError(
      "invalid-argument",
      "Customer name is required."
    );
  }


  if (
    !Array.isArray(
      order.items
    ) ||
    order.items.length === 0
  ) {
    throw new HttpsError(
      "invalid-argument",
      "Order must contain at least one item."
    );
  }


  for (
    const item of order.items
  ) {

    if (
      !item.id ||
      !item.name ||
      typeof item.price !==
        "number" ||
      !Number.isFinite(
        item.price
      ) ||
      !Number.isInteger(
        item.quantity
      ) ||
      item.quantity <= 0
    ) {
      throw new HttpsError(
        "invalid-argument",
        "Invalid order item."
      );
    }
  }
}


// =========================================
// MERGE ITEMS
// =========================================

function mergeItems(
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

    const existing =
      merged.find(
        (item) =>
          item.id ===
          newItem.id
      );


    if (existing) {

      existing.quantity +=
        newItem.quantity;

    } else {

      merged.push({
        ...newItem,
      });
    }
  }


  return merged;
}


// =========================================
// PLACE CUSTOMER ORDER
// =========================================

export const placeCustomerOrder =
  onCall(
    async (request) => {

      // =====================================
      // AUTHENTICATION
      // =====================================

      if (!request.auth) {

        throw new HttpsError(
          "unauthenticated",
          "You must be signed in to place an order."
        );
      }


      const customerUid =
        request.auth.uid;


      // =====================================
      // REQUEST DATA
      // =====================================

      const data =
        request.data as {
          order?: IncomingOrder;
          tableSessionId?: string;
        };


      const order =
        data.order;


      const tableSessionId =
        data.tableSessionId;


      // =====================================
      // BASIC VALIDATION
      // =====================================

      if (!order) {

        throw new HttpsError(
          "invalid-argument",
          "Order data is required."
        );
      }


      if (
        !tableSessionId ||
        typeof tableSessionId !==
          "string" ||
        tableSessionId.length <
          20 ||
        tableSessionId.length >
          200
      ) {

        throw new HttpsError(
          "invalid-argument",
          "A valid table session is required."
        );
      }


      validateOrder(order);


      // =====================================
      // FIND ACTIVE TABLE ORDER
      // =====================================

      const snapshot =
        await ordersCollection
          .where(
            "table",
            "==",
            order.table
          )
          .where(
            "status",
            "!=",
            "Completed"
          )
          .limit(1)
          .get();


      // =====================================
      // EXISTING ACTIVE ORDER
      // =====================================

      if (
        !snapshot.empty
      ) {

        const activeDoc =
          snapshot.docs[0];


        const activeOrder =
          activeDoc.data() as StoredOrder;


        // -----------------------------------
        // Verify customer ownership
        // -----------------------------------

        if (
          activeOrder.customerUid !==
          customerUid
        ) {

          throw new HttpsError(
            "permission-denied",
            "This table already has an active order from another customer session."
          );
        }


        // -----------------------------------
        // Verify table session
        // -----------------------------------

        if (
          activeOrder.tableSessionId !==
          tableSessionId
        ) {

          throw new HttpsError(
            "permission-denied",
            "This table session is not valid for the active order."
          );
        }


        // -----------------------------------
        // Existing items
        // -----------------------------------

        const existingItems =
          Array.isArray(
            activeOrder.items
          )
            ? activeOrder.items
            : [];


        // -----------------------------------
        // Merge items
        // -----------------------------------

        const mergedItems =
          mergeItems(
            existingItems,
            order.items
          );


        // -----------------------------------
        // Recalculate total
        // -----------------------------------

        const total =
          mergedItems.reduce(
            (
              sum,
              item
            ) =>
              sum +
              item.price *
                item.quantity,
            0
          );


        // -----------------------------------
        // Create new kitchen batch
        // -----------------------------------

        const newBatch:
          OrderBatch = {

          id:
            `${Date.now()}-${Math.random()
              .toString(36)
              .substring(2, 8)}`,

          items:
            order.items,

          status:
            "Pending",

          createdAt:
            order.createdAt,
        };


        // -----------------------------------
        // Existing batches
        // -----------------------------------

        const existingBatches =
          Array.isArray(
            activeOrder.batches
          ) &&
          activeOrder.batches
            .length > 0
            ? activeOrder.batches
            : [];


        // -----------------------------------
        // Update active order
        // -----------------------------------

        await activeDoc.ref.update({

          items:
            mergedItems,

          batches: [
            ...existingBatches,
            newBatch,
          ],

          total,

          paymentStatus:
            "Unpaid",

          paymentMethod:
            null,

          paidAt:
            null,

          updatedAt:
            FieldValue.serverTimestamp(),
        });


        logger.info(
          "Merged customer order",
          {
            orderId:
              activeDoc.id,

            table:
              order.table,

            customerUid,
          }
        );


        return {

          success:
            true,

          orderId:
            activeDoc.id,

          merged:
            true,
        };
      }


      // =====================================
      // NEW ORDER
      // =====================================

      const newOrder = {

        ...order,

        customerUid,

        tableSessionId,

        paymentStatus:
          "Unpaid",

        paymentMethod:
          null,

        paidAt:
          null,

        createdAt:
          order.createdAt,

        updatedAt:
          FieldValue.serverTimestamp(),
      };


      const newDoc =
        await ordersCollection.add(
          newOrder
        );


      logger.info(
        "Created customer order",
        {
          orderId:
            newDoc.id,

          table:
            order.table,

          customerUid,
        }
      );


      return {

        success:
          true,

        orderId:
          newDoc.id,

        merged:
          false,
      };
    }
  );