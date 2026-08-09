import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";

import { db } from "../../services/firebase";
import { kitchenService } from "../../services/kitchenService";

import type {
  Order,
  OrderBatch,
  OrderStatus,
} from "../../types/order";

function KitchenPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Kitchen page connected to Firestore");

    const q = query(
      collection(db, "orders"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        console.log("Orders found:", snapshot.size);

        const data: Order[] = snapshot.docs.map((doc) => ({
          ...(doc.data() as Order),
          id: doc.id,
        }));

        console.log("Orders:", data);

        setOrders(data);
        setLoading(false);
      },
      (error) => {
        console.error("Firestore Error:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // -----------------------------------------
  // Update Batch Status
  // -----------------------------------------
  const handleBatchStatusChange = async (
    orderId: string,
    batchId: string,
    status: OrderStatus
  ) => {
    try {
      await kitchenService.updateBatchStatus(
        orderId,
        batchId,
        status
      );
    } catch (error) {
      console.error(error);
      alert("Failed to update order batch.");
    }
  };

  // -----------------------------------------
  // Update Legacy Order Status
  // -----------------------------------------
  const handleLegacyStatusChange = async (
    orderId: string,
    status: OrderStatus
  ) => {
    try {
      await kitchenService.updateStatus(
        orderId,
        status
      );
    } catch (error) {
      console.error(error);
      alert("Failed to update order.");
    }
  };

  // -----------------------------------------
  // Loading
  // -----------------------------------------
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-xl text-gray-400">
          Loading Kitchen...
        </p>
      </div>
    );
  }

  // -----------------------------------------
  // Kitchen Dashboard
  // -----------------------------------------
  return (
    <div className="min-h-screen bg-black text-white p-6">

      <h1 className="text-4xl font-bold text-red-600 mb-8">
        🍳 Kitchen Dashboard
      </h1>

      {orders.length === 0 ? (
        <div className="text-center mt-20">

          <h2 className="text-3xl text-gray-400">
            No Orders Yet
          </h2>

          <p className="text-gray-500 mt-3">
            Waiting for customers...
          </p>

        </div>
      ) : (
        <div className="space-y-6">

          {orders.map((order) => {

            /*
             * New orders have batches.
             *
             * Older orders created before the batch
             * system may not have batches, so we create
             * a temporary legacy batch for display.
             */
            const batches: OrderBatch[] =
              order.batches && order.batches.length > 0
                ? order.batches
                : [
                    {
                      id: "legacy",
                      items: order.items,
                      status: order.status,
                      createdAt: order.createdAt,
                    },
                  ];

            return (
              <div
                key={order.id}
                className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 shadow-lg"
              >

                {/* -------------------------------- */}
                {/* Order Header */}
                {/* -------------------------------- */}

                <div className="flex justify-between items-center">

                  <div>

                    <h2 className="text-2xl font-bold">
                      🍽 Table {order.table}
                    </h2>

                    <p className="text-sm text-gray-500 mt-1">
                      Order #{order.id.slice(0, 8)}
                    </p>

                  </div>

                  <div className="text-right">

                    <p className="text-sm text-gray-400">
                      {batches.length}{" "}
                      {batches.length === 1
                        ? "batch"
                        : "batches"}
                    </p>

                  </div>

                </div>

                {/* -------------------------------- */}
                {/* Customer Information */}
                {/* -------------------------------- */}

                <div className="mt-5 space-y-2">

                  <p>
                    <strong>Customer:</strong>{" "}
                    {order.customerName}
                  </p>

                  {order.phone && (
                    <p>
                      <strong>Phone:</strong>{" "}
                      {order.phone}
                    </p>
                  )}

                  <p>
                    <strong>Order Time:</strong>{" "}
                    {new Date(
                      order.createdAt
                    ).toLocaleString()}
                  </p>

                </div>

                <div className="border-t border-zinc-700 my-6" />

                {/* -------------------------------- */}
                {/* Kitchen Batches */}
                {/* -------------------------------- */}

                <h3 className="text-xl font-bold mb-4">
                  Kitchen Batches
                </h3>

                <div className="space-y-4">

                  {batches.map(
                    (batch, index) => (

                      <div
                        key={batch.id}
                        className="bg-zinc-800 rounded-xl p-5 border border-zinc-700"
                      >

                        {/* Batch Header */}

                        <div className="flex justify-between items-center">

                          <div>

                            <h4 className="text-lg font-bold">
                              Batch {index + 1}
                            </h4>

                            <p className="text-sm text-gray-500 mt-1">
                              {new Date(
                                batch.createdAt
                              ).toLocaleString()}
                            </p>

                          </div>

                          {/* Batch Status */}

                          <span
                            className={`px-4 py-2 rounded-full font-semibold ${
                              batch.status ===
                              "Pending"
                                ? "bg-yellow-500 text-black"
                                : batch.status ===
                                  "Preparing"
                                ? "bg-blue-600 text-white"
                                : batch.status ===
                                  "Ready"
                                ? "bg-green-600 text-white"
                                : "bg-gray-700 text-white"
                            }`}
                          >
                            {batch.status}
                          </span>

                        </div>

                        {/* Batch Items */}

                        <div className="mt-5 space-y-2">

                          {batch.items.map(
                            (item) => (

                              <div
                                key={item.id}
                                className="flex justify-between"
                              >

                                <span>
                                  {item.name} ×{" "}
                                  {item.quantity}
                                </span>

                                <span>
                                  ₹
                                  {item.price *
                                    item.quantity}
                                </span>

                              </div>

                            )
                          )}

                        </div>

                        {/* Batch Actions */}

                        <div className="flex justify-end mt-5">

                          {/* Pending */}

                          {batch.status ===
                            "Pending" && (
                            <button
                              onClick={() => {
                                if (
                                  batch.id ===
                                  "legacy"
                                ) {
                                  handleLegacyStatusChange(
                                    order.id,
                                    "Preparing"
                                  );
                                } else {
                                  handleBatchStatusChange(
                                    order.id,
                                    batch.id,
                                    "Preparing"
                                  );
                                }
                              }}
                              className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-lg font-semibold transition"
                            >
                              Accept
                            </button>
                          )}

                          {/* Preparing */}

                          {batch.status ===
                            "Preparing" && (
                            <button
                              onClick={() => {
                                if (
                                  batch.id ===
                                  "legacy"
                                ) {
                                  handleLegacyStatusChange(
                                    order.id,
                                    "Ready"
                                  );
                                } else {
                                  handleBatchStatusChange(
                                    order.id,
                                    batch.id,
                                    "Ready"
                                  );
                                }
                              }}
                              className="bg-green-600 hover:bg-green-700 px-5 py-2 rounded-lg font-semibold transition"
                            >
                              Ready
                            </button>
                          )}

                          {/* Ready */}

                          {batch.status ===
                            "Ready" && (
                            <button
                              onClick={() => {
                                if (
                                  batch.id ===
                                  "legacy"
                                ) {
                                  handleLegacyStatusChange(
                                    order.id,
                                    "Completed"
                                  );
                                } else {
                                  handleBatchStatusChange(
                                    order.id,
                                    batch.id,
                                    "Completed"
                                  );
                                }
                              }}
                              className="bg-gray-700 hover:bg-gray-800 px-5 py-2 rounded-lg font-semibold transition"
                            >
                              Complete
                            </button>
                          )}

                        </div>

                      </div>
                    )
                  )}

                </div>

                {/* -------------------------------- */}
                {/* Special Instructions */}
                {/* -------------------------------- */}

                {order.instructions && (
                  <div className="mt-6 bg-zinc-800 rounded-xl p-4">

                    <p className="font-bold">
                      Special Instructions
                    </p>

                    <p className="mt-2 text-gray-300">
                      {order.instructions}
                    </p>

                  </div>
                )}

                {/* -------------------------------- */}
                {/* Overall Total */}
                {/* -------------------------------- */}

                <div className="border-t border-zinc-700 mt-6 pt-5 flex justify-between items-center">

                  <span className="text-xl font-bold">
                    Total
                  </span>

                  <span className="text-2xl font-bold text-yellow-400">
                    ₹{order.total}
                  </span>

                </div>

              </div>
            );
          })}

        </div>
      )}

    </div>
  );
}

export default KitchenPage;