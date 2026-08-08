import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";

import { db } from "../../services/firebase";
import { kitchenService } from "../../services/kitchenService";
import type { Order, OrderStatus } from "../../types/order";

function KitchenPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, "orders"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        ...(doc.data() as Order),
        id: doc.id,
      }));

      setOrders(data);
    });

    return () => unsubscribe();
  }, []);

  const handleStatusChange = async (
    orderId: string,
    status: OrderStatus
  ) => {
    try {
      await kitchenService.updateStatus(orderId, status);
    } catch (error) {
      console.error(error);
      alert("Failed to update order status.");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">

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

          {orders.map((order) => (

            <div
              key={order.id}
              className="bg-zinc-900 rounded-2xl p-6 shadow-lg border border-zinc-800"
            >

              {/* Header */}
              <div className="flex justify-between items-center">

                <h2 className="text-2xl font-bold">
                  🍽 Table {order.table}
                </h2>

                <div className="flex items-center gap-3">

                  <span
                    className={`px-4 py-2 rounded-full font-semibold ${
                      order.status === "Pending"
                        ? "bg-yellow-500 text-black"
                        : order.status === "Preparing"
                        ? "bg-blue-600 text-white"
                        : order.status === "Ready"
                        ? "bg-green-600 text-white"
                        : "bg-gray-600 text-white"
                    }`}
                  >
                    {order.status}
                  </span>

                  {order.status === "Pending" && (
                    <button
                      onClick={() =>
                        handleStatusChange(
                          order.id,
                          "Preparing"
                        )
                      }
                      className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-semibold"
                    >
                      Accept
                    </button>
                  )}

                  {order.status === "Preparing" && (
                    <button
                      onClick={() =>
                        handleStatusChange(
                          order.id,
                          "Ready"
                        )
                      }
                      className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-semibold"
                    >
                      Ready
                    </button>
                  )}

                  {order.status === "Ready" && (
                    <button
                      onClick={() =>
                        handleStatusChange(
                          order.id,
                          "Completed"
                        )
                      }
                      className="bg-gray-700 hover:bg-gray-800 px-4 py-2 rounded-lg font-semibold"
                    >
                      Complete
                    </button>
                  )}

                </div>

              </div>

              {/* Customer Details */}
              <div className="mt-5 space-y-2">

                <p>
                  <span className="font-semibold">
                    Customer:
                  </span>{" "}
                  {order.customerName}
                </p>

                {order.phone && (
                  <p>
                    <span className="font-semibold">
                      Phone:
                    </span>{" "}
                    {order.phone}
                  </p>
                )}

                <p>
                  <span className="font-semibold">
                    Order Time:
                  </span>{" "}
                  {new Date(order.createdAt).toLocaleTimeString()}
                </p>

              </div>

              <div className="border-t border-zinc-700 my-5"></div>

              {/* Items */}
              <h3 className="text-xl font-bold mb-3">
                Items
              </h3>

              <div className="space-y-2">

                {order.items.map((item) => (

                  <div
                    key={item.id}
                    className="flex justify-between"
                  >
                    <span>
                      {item.name} × {item.quantity}
                    </span>

                    <span>
                      ₹{item.price * item.quantity}
                    </span>

                  </div>

                ))}

              </div>

              {/* Instructions */}
              {order.instructions && (
                <div className="mt-5 bg-zinc-800 rounded-xl p-4">

                  <p className="font-semibold">
                    Special Instructions
                  </p>

                  <p className="text-gray-300 mt-2">
                    {order.instructions}
                  </p>

                </div>
              )}

              {/* Total */}
              <div className="border-t border-zinc-700 mt-6 pt-5 flex justify-between items-center">

                <span className="text-xl font-bold">
                  Total
                </span>

                <span className="text-2xl font-bold text-yellow-400">
                  ₹{order.total}
                </span>

              </div>

            </div>

          ))}

        </div>
      )}

    </div>
  );
}

export default KitchenPage;