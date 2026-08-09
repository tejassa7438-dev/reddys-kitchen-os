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

  if (!order) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <h1 className="text-3xl font-bold">
          Loading Order...
        </h1>
      </div>
    );
  }

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
    <div className="min-h-screen bg-black text-white p-8">

      <h1 className="text-5xl font-bold text-red-600">
        REDDY'S KITCHEN
      </h1>

      <p className="text-gray-400 mt-3">
        Live Order Tracking
      </p>

      <div className="bg-zinc-900 rounded-3xl mt-10 p-8">

        <h2 className="text-3xl font-bold">
          Table {order.table}
        </h2>

        <p className="mt-4 text-xl">
          Customer:
          {" "}
          <span className="text-yellow-400">
            {order.customerName}
          </span>
        </p>

        <div className="mt-10">

          <h3 className="text-xl text-gray-400">
            Current Status
          </h3>

          <h1 className={`text-6xl font-bold mt-3 ${getColor()}`}>
            {order.status}
          </h1>

        </div>

        <div className="mt-10">

          <h3 className="text-2xl font-bold mb-5">
            Ordered Items
          </h3>

          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex justify-between py-2"
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

        <div className="border-t border-zinc-700 mt-8 pt-6 flex justify-between">

          <span className="text-2xl font-bold">
            Total
          </span>

          <span className="text-2xl font-bold text-yellow-400">
            ₹{order.total}
          </span>

        </div>

      </div>

      <button
        onClick={() => navigate("/")}
        className="mt-10 bg-red-600 hover:bg-red-700 px-8 py-4 rounded-xl font-bold"
      >
        Back Home
      </button>

    </div>
  );
}

export default TrackOrderPage;