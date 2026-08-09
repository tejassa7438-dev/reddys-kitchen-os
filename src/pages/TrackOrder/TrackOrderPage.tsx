import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { orderService } from "../../services/orderService";

import type {
  Order,
  OrderStatus,
} from "../../types/order";

function TrackOrderPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] =
    useState<Order | null>(null);

  // Keeps track of the previous status.
  // This prevents the sound from playing
  // repeatedly while Firestore updates.
  const previousStatus =
    useRef<OrderStatus | null>(null);

  // Prevents the Ready sound from playing
  // more than once during this page session.
  const readySoundPlayed =
    useRef(false);

  // =========================================
  // LIVE ORDER SUBSCRIPTION
  // =========================================

  useEffect(() => {
    if (!orderId) {
      return;
    }

    const unsubscribe =
      orderService.subscribeToOrder(
        orderId,
        (data) => {
          setOrder(data);
        }
      );

    return () => unsubscribe();
  }, [orderId]);

  // =========================================
  // READY NOTIFICATION SOUND
  // =========================================

  useEffect(() => {
    if (!order) {
      return;
    }

    const currentStatus =
      order.status;

    // First Firestore snapshot.
    //
    // We don't play the sound here because
    // the order may already be Ready when
    // the customer opens the tracking page.

    if (
      previousStatus.current === null
    ) {
      previousStatus.current =
        currentStatus;

      return;
    }

    // Detect:
    //
    // Pending    → Ready
    // Preparing  → Ready
    //
    // We only want the sound when the status
    // actually changes INTO Ready.

    if (
      currentStatus === "Ready" &&
      previousStatus.current !== "Ready" &&
      !readySoundPlayed.current
    ) {
      const audio = new Audio(
        "/sounds/order-ready.mp3"
      );

      audio.volume = 1;

      audio.play().catch((error) => {
        console.warn(
          "Order ready sound could not play:",
          error
        );
      });

      readySoundPlayed.current = true;
    }

    // Always remember the latest status.

    previousStatus.current =
      currentStatus;

  }, [order]);

  // =========================================
  // REMOVE COMPLETED ORDER FROM ACTIVE ORDER
  // =========================================

  useEffect(() => {
    if (!order) {
      return;
    }

    if (order.status === "Completed") {
      localStorage.removeItem(
        `activeOrderId_table_${order.table}`
      );
    }
  }, [order]);

  // =========================================
  // LOADING
  // =========================================

  if (!order) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-5">

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

  // =========================================
  // STATUS HELPERS
  // =========================================

  const statusSteps: OrderStatus[] = [
    "Pending",
    "Preparing",
    "Ready",
    "Completed",
  ];

  const statusIndex =
    statusSteps.indexOf(
      order.status
    );

  const getStatusColor = () => {
    switch (order.status) {
      case "Pending":
        return "text-yellow-400";

      case "Preparing":
        return "text-orange-400";

      case "Ready":
        return "text-green-400";

      case "Completed":
        return "text-gray-300";

      default:
        return "text-white";
    }
  };

  const getStatusMessage = () => {
    switch (order.status) {
      case "Pending":
        return "Your order has been received and is waiting for the kitchen.";

      case "Preparing":
        return "The kitchen is preparing your order right now.";

      case "Ready":
        return "Your order is ready. Please collect it when called.";

      case "Completed":
        return "Your order has been completed. Thank you for dining with us!";

      default:
        return "Your order is being processed.";
    }
  };

  const getStepIcon = (
    step: OrderStatus
  ) => {
    switch (step) {
      case "Pending":
        return "📋";

      case "Preparing":
        return "👨‍🍳";

      case "Ready":
        return "🔔";

      case "Completed":
        return "✅";

      default:
        return "•";
    }
  };

  const isStepCompleted = (
    index: number
  ) => {
    return index <= statusIndex;
  };

  // =========================================
  // PAGE
  // =========================================

  return (
    <div className="min-h-screen bg-black text-white px-5 py-10">

      <div className="max-w-3xl mx-auto">

        {/* ================================= */}
        {/* HEADER */}
        {/* ================================= */}

        <div className="text-center">

          <h1 className="text-4xl md:text-5xl font-bold text-red-600">
            REDDY'S KITCHEN
          </h1>

          <p className="text-gray-400 mt-3">
            Live Order Tracking
          </p>

        </div>

        {/* ================================= */}
        {/* ORDER CARD */}
        {/* ================================= */}

        <div className="bg-zinc-900 rounded-3xl mt-10 p-6 md:p-8 border border-zinc-800">

          {/* Order Header */}

          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-5">

            <div>

              <p className="text-sm text-gray-500">
                Order ID
              </p>

              <p className="font-mono text-sm text-gray-300 mt-1 break-all">
                #{order.id}
              </p>

              <h2 className="text-3xl font-bold mt-5">
                Table {order.table}
              </h2>

              <p className="mt-2 text-gray-300">
                Customer:{" "}
                <span className="text-yellow-400 font-semibold">
                  {order.customerName}
                </span>
              </p>

            </div>

            <div className="md:text-right">

              <p className="text-sm text-gray-500">
                Order Total
              </p>

              <p className="text-3xl font-bold text-yellow-400 mt-1">
                ₹{order.total}
              </p>

            </div>

          </div>

          {/* ================================= */}
          {/* CURRENT STATUS */}
          {/* ================================= */}

          <div className="mt-10 text-center">

            <p className="text-gray-500 text-sm uppercase tracking-wider">
              Current Status
            </p>

            <h2
              className={`text-5xl md:text-6xl font-bold mt-3 ${getStatusColor()}`}
            >
              {order.status}
            </h2>

            <p className="text-gray-400 mt-4 max-w-xl mx-auto">
              {getStatusMessage()}
            </p>

          </div>

          {/* ================================= */}
          {/* PROGRESS TRACKER */}
          {/* ================================= */}

          <div className="mt-10">

            <div className="grid grid-cols-4 gap-2">

              {statusSteps.map(
                (step, index) => {

                  const completed =
                    isStepCompleted(
                      index
                    );

                  const current =
                    order.status ===
                    step;

                  return (
                    <div
                      key={step}
                      className="text-center"
                    >

                      <div
                        className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center text-xl transition ${
                          completed
                            ? "bg-green-600 text-white"
                            : "bg-zinc-800 text-gray-600"
                        } ${
                          current
                            ? "ring-4 ring-green-600/30"
                            : ""
                        }`}
                      >
                        {getStepIcon(
                          step
                        )}
                      </div>

                      <p
                        className={`text-xs md:text-sm font-semibold mt-3 ${
                          completed
                            ? "text-white"
                            : "text-gray-600"
                        }`}
                      >
                        {step}
                      </p>

                    </div>
                  );
                }
              )}

            </div>

            <div className="mt-5 h-2 bg-zinc-800 rounded-full overflow-hidden">

              <div
                className="h-full bg-green-600 transition-all duration-500"
                style={{
                  width:
                    statusIndex === 0
                      ? "0%"
                      : `${
                          (statusIndex /
                            (statusSteps.length -
                              1)) *
                          100
                        }%`,
                }}
              />

            </div>

          </div>

          {/* ================================= */}
          {/* ORDERED ITEMS */}
          {/* ================================= */}

          <div className="mt-10">

            <h3 className="text-2xl font-bold mb-5">
              Ordered Items
            </h3>

            <div className="space-y-3">

              {order.items.map(
                (item) => (

                  <div
                    key={item.id}
                    className="flex justify-between items-center py-3 border-b border-zinc-800"
                  >

                    <div>

                      <p className="font-semibold">
                        {item.name}
                      </p>

                      <p className="text-sm text-gray-500">
                        ₹{item.price} ×{" "}
                        {item.quantity}
                      </p>

                    </div>

                    <p className="font-semibold">
                      ₹
                      {item.price *
                        item.quantity}
                    </p>

                  </div>

                )
              )}

            </div>

          </div>

          {/* ================================= */}
          {/* BATCH INFORMATION */}
          {/* ================================= */}

          {order.batches &&
            order.batches.length > 0 && (

              <div className="mt-10">

                <h3 className="text-2xl font-bold mb-5">
                  Kitchen Progress
                </h3>

                <div className="space-y-4">

                  {order.batches.map(
                    (batch, index) => (

                      <div
                        key={batch.id}
                        className="bg-zinc-800 rounded-2xl p-4"
                      >

                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">

                          <div>

                            <p className="font-semibold">
                              Batch{" "}
                              {index + 1}
                            </p>

                            <p className="text-sm text-gray-500 mt-1">
                              {batch.items.length}{" "}
                              item
                              {batch.items.length ===
                              1
                                ? ""
                                : "s"}
                            </p>

                          </div>

                          <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold w-fit ${
                              batch.status ===
                              "Pending"
                                ? "bg-yellow-600 text-black"
                                : batch.status ===
                                  "Preparing"
                                ? "bg-orange-600 text-white"
                                : batch.status ===
                                  "Ready"
                                ? "bg-green-600 text-white"
                                : "bg-blue-600 text-white"
                            }`}
                          >
                            {batch.status}
                          </span>

                        </div>

                        <div className="mt-3 space-y-1">

                          {batch.items.map(
                            (item) => (

                              <div
                                key={item.id}
                                className="flex justify-between text-sm text-gray-400"
                              >

                                <span>
                                  {item.quantity}{" "}
                                  ×{" "}
                                  {item.name}
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

                      </div>

                    )
                  )}

                </div>

              </div>

            )}

          {/* ================================= */}
          {/* SPECIAL INSTRUCTIONS */}
          {/* ================================= */}

          {order.instructions && (

            <div className="mt-8 bg-zinc-800 rounded-2xl p-5">

              <p className="text-sm text-gray-400">
                Special Instructions
              </p>

              <p className="mt-2 text-gray-200">
                {order.instructions}
              </p>

            </div>

          )}

          {/* ================================= */}
          {/* COMPLETED */}
          {/* ================================= */}

          {order.status ===
            "Completed" && (

            <div className="mt-8 bg-green-900/30 border border-green-700 rounded-2xl p-6 text-center">

              <div className="text-4xl">
                🎉
              </div>

              <p className="text-green-400 text-xl font-bold mt-3">
                Order Completed!
              </p>

              <p className="text-gray-400 mt-2">
                Thank you for dining with
                REDDY'S KITCHEN.
              </p>

            </div>

          )}

        </div>

        {/* ================================= */}
        {/* BACK HOME */}
        {/* ================================= */}

        <div className="text-center">

          <button
            onClick={() =>
              navigate("/")
            }
            className="mt-10 bg-red-600 hover:bg-red-700 px-8 py-4 rounded-xl font-bold transition"
          >
            Back Home
          </button>

        </div>

      </div>

    </div>
  );
}

export default TrackOrderPage;