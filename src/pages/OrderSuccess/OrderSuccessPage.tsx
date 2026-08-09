import {
  useEffect,
  useRef,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import { orderService } from "../../services/orderService";

import type {
  Order,
  OrderStatus,
} from "../../types/order";

function OrderSuccessPage() {
  const navigate = useNavigate();

  const [order, setOrder] =
    useState<Order | null>(null);

  const [loading, setLoading] =
    useState(true);

  // Previous order status
  const previousStatus =
    useRef<OrderStatus | null>(
      null
    );

  // Prevent duplicate sound
  const readySoundPlayed =
    useRef(false);

  // =========================================
  // LIVE ORDER
  // =========================================

  useEffect(() => {
    const orderId =
      localStorage.getItem(
        "activeOrderId"
      );

    if (!orderId) {
      setLoading(false);
      return;
    }

    const unsubscribe =
      orderService.subscribeToOrder(
        orderId,
        (data) => {
          setOrder(data);
          setLoading(false);
        }
      );

    return () => unsubscribe();
  }, []);

  // =========================================
  // READY SOUND
  // =========================================

  useEffect(() => {
    if (!order) {
      return;
    }

    const currentStatus =
      order.status;

    // First snapshot:
    // don't play anything.
    //
    // This prevents the sound from playing
    // if the customer opens /success when
    // the order is already Ready.

    if (
      previousStatus.current === null
    ) {
      previousStatus.current =
        currentStatus;

      return;
    }

    // Play ONLY when the order changes
    // from another status INTO Ready.

    if (
      currentStatus === "Ready" &&
      previousStatus.current !==
        "Ready" &&
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

      readySoundPlayed.current =
        true;
    }

    previousStatus.current =
      currentStatus;

  }, [order]);

  // =========================================
  // TRACK ORDER
  // =========================================

  const trackOrder = () => {
    if (!order?.id) {
      alert(
        "Order tracking information is unavailable."
      );

      return;
    }

    navigate(
      `/track/${order.id}`
    );
  };

  // =========================================
  // LOADING
  // =========================================

  if (loading) {
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
            Please wait...
          </p>

        </div>

      </div>
    );
  }

  // =========================================
  // NO ORDER
  // =========================================

  if (!order) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-5">

        <div className="text-center">

          <div className="text-5xl mb-5">
            ⚠️
          </div>

          <h1 className="text-2xl font-bold">
            Order Not Found
          </h1>

          <p className="text-gray-500 mt-2">
            We couldn't find your order.
          </p>

          <button
            onClick={() =>
              navigate("/")
            }
            className="mt-8 bg-red-600 hover:bg-red-700 px-8 py-4 rounded-xl font-bold"
          >
            Back to Home
          </button>

        </div>

      </div>
    );
  }

  // =========================================
  // STATUS COLOR
  // =========================================

  const getStatusColor = () => {
    switch (order.status) {
      case "Pending":
        return "text-yellow-400";

      case "Preparing":
        return "text-orange-400";

      case "Ready":
        return "text-green-400";

      case "Completed":
        return "text-gray-400";

      default:
        return "text-white";
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-5 py-10">

      {/* ================================= */}
      {/* SUCCESS ICON */}
      {/* ================================= */}

      <div className="text-7xl">
        🎉
      </div>

      {/* ================================= */}
      {/* TITLE */}
      {/* ================================= */}

      <h1 className="text-5xl font-bold text-green-500 mt-6 text-center">
        Order Placed!
      </h1>

      <p className="text-gray-400 mt-4 text-center max-w-md">

        Thank you for ordering from

        <br />

        <span className="text-yellow-400 font-bold">
          REDDY'S KITCHEN
        </span>

      </p>

      {/* ================================= */}
      {/* ORDER STATUS */}
      {/* ================================= */}

      <div className="bg-zinc-900 rounded-2xl p-6 mt-10 w-full max-w-md">

        <div className="flex justify-between items-center">

          <span>
            Order Status
          </span>

          <span
            className={`font-semibold ${getStatusColor()}`}
          >
            {order.status}
          </span>

        </div>

        <div className="flex justify-between mt-4">

          <span>
            Table
          </span>

          <span>
            {order.table}
          </span>

        </div>

        <div className="flex justify-between mt-4">

          <span>
            Estimated Time
          </span>

          <span>
            20–25 mins
          </span>

        </div>

      </div>

      {/* ================================= */}
      {/* READY NOTIFICATION */}
      {/* ================================= */}

      {order.status ===
        "Ready" && (

        <div className="mt-6 w-full max-w-md bg-green-900/30 border border-green-700 rounded-2xl p-5 text-center">

          <div className="text-4xl">
            🔔
          </div>

          <p className="text-green-400 font-bold text-xl mt-2">
            Your Order Is Ready!
          </p>

          <p className="text-gray-400 mt-2">
            Please collect your order.
          </p>

        </div>

      )}

      {/* ================================= */}
      {/* TRACK ORDER */}
      {/* ================================= */}

      <button
        onClick={trackOrder}
        className="mt-8 w-full max-w-md bg-green-600 hover:bg-green-700 px-8 py-4 rounded-xl font-bold transition"
      >
        📍 Track My Order
      </button>

      {/* ================================= */}
      {/* BACK HOME */}
      {/* ================================= */}

      <button
        onClick={() =>
          navigate("/")
        }
        className="mt-4 w-full max-w-md bg-red-600 hover:bg-red-700 px-8 py-4 rounded-xl font-bold transition"
      >
        Back to Home
      </button>

    </div>
  );
}

export default OrderSuccessPage;