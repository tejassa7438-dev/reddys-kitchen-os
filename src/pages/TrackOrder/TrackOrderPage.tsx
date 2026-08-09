import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { orderService } from "../../services/orderService";
import type { Order } from "../../types/order";

function TrackOrderPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!orderId) return;

    const unsubscribe = orderService.subscribeToOrder(
      orderId,
      (data) => {
        setOrder(data);
      }
    );

    return () => unsubscribe();
  }, [orderId]);

  // -----------------------------------------
  // Remove completed order from active order
  // -----------------------------------------

  useEffect(() => {
    if (!order) return;

    if (order.status === "Completed") {
      localStorage.removeItem(
        `activeOrderId_table_${order.table}`
      );
    }
  }, [order]);

  // -----------------------------------------
  // Loading
  // -----------------------------------------

  if (!order) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">

          <div className="text-5xl mb-5">
            🍳
          </div>

          <h1 className="text-2xl font-bold">
            Loading Order...
          </h1>

          <p className="text-gray-500 mt-2">
            Please wait while we find your order.
          </p>

        </div>
      </div>
    );
  }

  // -----------------------------------------
  // Status Color
  // -----------------------------------------

  const getColor = () => {
    switch (order.status) {
      case "Pending":
        return "text-yellow-400";

      case "Preparing":
        return "text-blue-400";

      case "Ready":
        return "text-green-400";

      case "Completed":
        return "text-gray-400";

      default:
        return "text-white";
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center px-5 py-12">

      {/* ----------------------------------- */}
      {/* Header */}
      {/* ----------------------------------- */}

      <h1 className="text-5xl font-bold text-red-600 text-center">
        REDDY'S KITCHEN
      </h1>

      <p className="text-gray-400 mt-3 text-center">
        Live Order Tracking
      </p>

      {/* ----------------------------------- */}
      {/* Order Card */}
      {/* ----------------------------------- */}

      <div className="bg-zinc-900 rounded-3xl mt-10 p-8 w-full max-w-2xl border border-zinc-800">

        {/* Table */}

        <h2 className="text-3xl font-bold">
          Table {order.table}
        </h2>

        {/* Customer */}

        <p className="mt-4 text-xl">
          Customer:{" "}
          <span className="text-yellow-400">
            {order.customerName}
          </span>
        </p>

        {/* ----------------------------------- */}
        {/* Current Status */}
        {/* ----------------------------------- */}

        <div className="mt-10">

          <h3 className="text-xl text-gray-400">
            Current Status
          </h3>

          <h1
            className={`text-6xl font-bold mt-3 ${getColor()}`}
          >
            {order.status}
          </h1>

        </div>

        {/* ----------------------------------- */}
        {/* Status Progress */}
        {/* ----------------------------------- */}

        <div className="mt-8 grid grid-cols-4 gap-2">

          <div
            className={`text-center p-3 rounded-lg ${
              order.status === "Pending" ||
              order.status === "Preparing" ||
              order.status === "Ready" ||
              order.status === "Completed"
                ? "bg-yellow-500 text-black"
                : "bg-zinc-800 text-gray-500"
            }`}
          >
            <p className="font-bold text-sm">
              Pending
            </p>
          </div>

          <div
            className={`text-center p-3 rounded-lg ${
              order.status === "Preparing" ||
              order.status === "Ready" ||
              order.status === "Completed"
                ? "bg-blue-600 text-white"
                : "bg-zinc-800 text-gray-500"
            }`}
          >
            <p className="font-bold text-sm">
              Preparing
            </p>
          </div>

          <div
            className={`text-center p-3 rounded-lg ${
              order.status === "Ready" ||
              order.status === "Completed"
                ? "bg-green-600 text-white"
                : "bg-zinc-800 text-gray-500"
            }`}
          >
            <p className="font-bold text-sm">
              Ready
            </p>
          </div>

          <div
            className={`text-center p-3 rounded-lg ${
              order.status === "Completed"
                ? "bg-gray-600 text-white"
                : "bg-zinc-800 text-gray-500"
            }`}
          >
            <p className="font-bold text-sm">
              Completed
            </p>
          </div>

        </div>

        {/* ----------------------------------- */}
        {/* Ordered Items */}
        {/* ----------------------------------- */}

        <div className="mt-10">

          <h3 className="text-2xl font-bold mb-5">
            Ordered Items
          </h3>

          <div className="space-y-3">

            {order.items.map((item) => (

              <div
                key={item.id}
                className="flex justify-between py-2 border-b border-zinc-800"
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

        </div>

        {/* ----------------------------------- */}
        {/* Total */}
        {/* ----------------------------------- */}

        <div className="border-t border-zinc-700 mt-8 pt-6 flex justify-between">

          <span className="text-2xl font-bold">
            Total
          </span>

          <span className="text-2xl font-bold text-yellow-400">
            ₹{order.total}
          </span>

        </div>

        {/* ----------------------------------- */}
        {/* Completed Message */}
        {/* ----------------------------------- */}

        {order.status === "Completed" && (

          <div className="mt-8 bg-green-900/30 border border-green-700 rounded-xl p-5 text-center">

            <p className="text-green-400 text-xl font-bold">
              🎉 Order Completed!
            </p>

            <p className="text-gray-400 mt-2">
              Thank you for dining with REDDY'S KITCHEN.
            </p>

          </div>

        )}

      </div>

      {/* ----------------------------------- */}
      {/* Back Home */}
      {/* ----------------------------------- */}

      <button
        onClick={() => navigate("/")}
        className="mt-10 bg-red-600 hover:bg-red-700 px-8 py-4 rounded-xl font-bold transition"
      >
        Back Home
      </button>

    </div>
  );
}

export default TrackOrderPage;