import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import AdminLayout from "../../components/admin/AdminLayout";
import Loading from "../../components/ui/Loading";
import Button from "../../components/ui/Button";

import { orderService } from "../../services/orderService";

import type {
  Order,
  OrderStatus,
} from "../../types/order";

function OrdersManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [status, setStatus] =
    useState<OrderStatus | "All">("All");

  useEffect(() => {
    const unsubscribe =
      orderService.subscribeToOrders((data) => {
        setOrders(data);
        setLoading(false);
      });

    return unsubscribe;
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        order.customerName
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        order.table
          .toString()
          .includes(search);

      const matchesStatus =
        status === "All" ||
        order.status === status;

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [orders, search, status]);

  async function updateStatus(
    id: string,
    newStatus: OrderStatus
  ) {
    try {
      await orderService.updateOrderStatus(
        id,
        newStatus
      );

      toast.success(
        `Order marked as ${newStatus}`
      );
    } catch {
      toast.error(
        "Failed to update order"
      );
    }
  }

  async function deleteOrder(
    id: string
  ) {
    if (
      !window.confirm(
        "Delete this order?"
      )
    ) {
      return;
    }

    try {
      await orderService.deleteOrder(id);

      toast.success(
        "Order deleted"
      );
    } catch {
      toast.error(
        "Delete failed"
      );
    }
  }

  if (loading) {
    return (
      <AdminLayout title="Orders">
        <Loading />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Orders">

      {/* Toolbar */}

      <div className="flex flex-col md:flex-row gap-4 mb-8">

        <input
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          placeholder="Search customer or table..."
          className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3"
        />

        <select
          value={status}
          onChange={(e) =>
            setStatus(
              e.target.value as
                | OrderStatus
                | "All"
            )
          }
          className="bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3"
        >
          <option>All</option>
          <option>Pending</option>
          <option>Preparing</option>
          <option>Ready</option>
          <option>Completed</option>
        </select>
      </div>      {/* Orders List */}

      <div className="space-y-6">

        {filteredOrders.length === 0 && (
          <div className="bg-zinc-900 rounded-2xl p-10 text-center text-gray-400">
            No orders found.
          </div>
        )}

        {filteredOrders.map((order) => (
          <div
            key={order.id}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6"
          >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

              <div>
                <h2 className="text-2xl font-bold">
                  Table #{order.table}
                </h2>

                <p className="text-gray-400">
                  {order.customerName}
                </p>

                {order.phone && (
                  <p className="text-sm text-gray-500">
                    📞 {order.phone}
                  </p>
                )}
              </div>

              <div className="text-right">

                <h2 className="text-2xl font-bold text-yellow-400">
                  ₹{order.total}
                </h2>

                <span
                  className={`inline-block mt-2 px-4 py-1 rounded-full text-sm font-semibold
                  ${
                    order.status === "Pending"
                      ? "bg-yellow-600"
                      : order.status === "Preparing"
                      ? "bg-orange-600"
                      : order.status === "Ready"
                      ? "bg-green-600"
                      : "bg-blue-600"
                  }`}
                >
                  {order.status}
                </span>

              </div>

            </div>

            {/* Items */}

            <div className="mt-6">

              <h3 className="font-semibold mb-2">
                Ordered Items
              </h3>

              <div className="space-y-2">

                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between text-gray-300"
                  >
                    <span>
                      {item.quantity} × {item.name}
                    </span>

                    <span>
                      ₹{item.price * item.quantity}
                    </span>
                  </div>
                ))}

              </div>

            </div>

            {/* Instructions */}

            {order.instructions && (
              <div className="mt-5 rounded-xl bg-zinc-800 p-4">
                <p className="text-sm text-gray-400 mb-1">
                  Special Instructions
                </p>

                <p>{order.instructions}</p>
              </div>
            )}

            {/* Actions */}

            <div className="mt-6 flex flex-wrap gap-3">

              <Button
                variant="secondary"
                onClick={() =>
                  updateStatus(order.id, "Pending")
                }
              >
                Pending
              </Button>

              <Button
                variant="primary"
                onClick={() =>
                  updateStatus(order.id, "Preparing")
                }
              >
                Preparing
              </Button>

              <Button
                variant="success"
                onClick={() =>
                  updateStatus(order.id, "Ready")
                }
              >
                Ready
              </Button>

              <Button
                variant="secondary"
                onClick={() =>
                  updateStatus(order.id, "Completed")
                }
              >
                Completed
              </Button>

              <Button
                variant="danger"
                onClick={() =>
                  deleteOrder(order.id)
                }
              >
                Delete
              </Button>

            </div>

          </div>
        ))}

      </div>

    </AdminLayout>
  );
}

export default OrdersManagement;