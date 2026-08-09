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
  const [orders, setOrders] =
    useState<Order[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState<OrderStatus | "All">(
      "All"
    );

  const [tableFilter, setTableFilter] =
    useState("All");

  // =========================================
  // LIVE ORDERS
  // =========================================

  useEffect(() => {
    const unsubscribe =
      orderService.subscribeToOrders(
        (data) => {
          setOrders(data);
          setLoading(false);
        }
      );

    return unsubscribe;
  }, []);

  // =========================================
  // TABLE LIST
  // =========================================

  const tables = useMemo(() => {
    const uniqueTables =
      Array.from(
        new Set(
          orders.map((order) =>
            order.table.toString()
          )
        )
      );

    return uniqueTables.sort(
      (a, b) =>
        Number(a) - Number(b)
    );
  }, [orders]);

  // =========================================
  // FILTER ORDERS
  // =========================================

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const searchText =
        search.toLowerCase();

      const matchesSearch =
        order.customerName
          .toLowerCase()
          .includes(searchText) ||
        order.table
          .toString()
          .includes(searchText) ||
        order.id
          .toLowerCase()
          .includes(searchText);

      const matchesStatus =
        status === "All" ||
        order.status === status;

      const matchesTable =
        tableFilter === "All" ||
        order.table.toString() ===
          tableFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesTable
      );
    });
  }, [
    orders,
    search,
    status,
    tableFilter,
  ]);

  // =========================================
  // UPDATE ORDER STATUS
  // =========================================

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
    } catch (error) {
      console.error(error);

      toast.error(
        "Failed to update order"
      );
    }
  }

  // =========================================
  // DELETE ORDER
  // =========================================

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
      await orderService.deleteOrder(
        id
      );

      toast.success(
        "Order deleted"
      );
    } catch (error) {
      console.error(error);

      toast.error(
        "Delete failed"
      );
    }
  }

  // =========================================
  // ORDER AGE
  // =========================================

  function getOrderAge(
    createdAt: string
  ) {
    const created =
      new Date(createdAt);

    const now =
      new Date();

    const difference =
      Math.max(
        0,
        now.getTime() -
          created.getTime()
      );

    const minutes = Math.floor(
      difference / 60000
    );

    if (minutes < 1) {
      return "Just now";
    }

    if (minutes < 60) {
      return `${minutes} min ago`;
    }

    const hours =
      Math.floor(minutes / 60);

    const remainingMinutes =
      minutes % 60;

    if (hours < 24) {
      return `${hours}h ${remainingMinutes}m ago`;
    }

    const days =
      Math.floor(hours / 24);

    return `${days}d ago`;
  }

  // =========================================
  // STATUS COLOR
  // =========================================

  function getStatusClass(
    orderStatus: OrderStatus
  ) {
    if (orderStatus === "Pending") {
      return "bg-yellow-600 text-black";
    }

    if (
      orderStatus === "Preparing"
    ) {
      return "bg-orange-600 text-white";
    }

    if (orderStatus === "Ready") {
      return "bg-green-600 text-white";
    }

    return "bg-blue-600 text-white";
  }

  // =========================================
  // LOADING
  // =========================================

  if (loading) {
    return <Loading />;
  }

  // =========================================
  // PAGE
  // =========================================

  return (
    <AdminLayout title="Orders Management">

      {/* ===================================== */}
      {/* SUMMARY */}
      {/* ===================================== */}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <p className="text-gray-400">
            Total Orders
          </p>

          <p className="text-3xl font-bold mt-2">
            {orders.length}
          </p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <p className="text-gray-400">
            Pending
          </p>

          <p className="text-3xl font-bold text-yellow-400 mt-2">
            {
              orders.filter(
                (order) =>
                  order.status ===
                  "Pending"
              ).length
            }
          </p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <p className="text-gray-400">
            Preparing
          </p>

          <p className="text-3xl font-bold text-orange-400 mt-2">
            {
              orders.filter(
                (order) =>
                  order.status ===
                  "Preparing"
              ).length
            }
          </p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <p className="text-gray-400">
            Ready
          </p>

          <p className="text-3xl font-bold text-green-400 mt-2">
            {
              orders.filter(
                (order) =>
                  order.status ===
                  "Ready"
              ).length
            }
          </p>
        </div>

      </div>

      {/* ===================================== */}
      {/* FILTER TOOLBAR */}
      {/* ===================================== */}

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-8">

        <div className="grid md:grid-cols-3 gap-4">

          {/* Search */}

          <input
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            placeholder="Search customer, table or order ID..."
            className="bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 outline-none focus:border-red-500"
          />

          {/* Status */}

          <select
            value={status}
            onChange={(e) =>
              setStatus(
                e.target.value as
                  | OrderStatus
                  | "All"
              )
            }
            className="bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 outline-none focus:border-red-500"
          >
            <option value="All">
              All Statuses
            </option>

            <option value="Pending">
              Pending
            </option>

            <option value="Preparing">
              Preparing
            </option>

            <option value="Ready">
              Ready
            </option>

            <option value="Completed">
              Completed
            </option>
          </select>

          {/* Table */}

          <select
            value={tableFilter}
            onChange={(e) =>
              setTableFilter(
                e.target.value
              )
            }
            className="bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 outline-none focus:border-red-500"
          >
            <option value="All">
              All Tables
            </option>

            {tables.map((table) => (
              <option
                key={table}
                value={table}
              >
                Table #{table}
              </option>
            ))}
          </select>

        </div>

        <div className="mt-4 text-sm text-gray-400">
          Showing{" "}
          <span className="text-white font-semibold">
            {filteredOrders.length}
          </span>{" "}
          of{" "}
          <span className="text-white font-semibold">
            {orders.length}
          </span>{" "}
          orders
        </div>

      </div>

      {/* ===================================== */}
      {/* ORDERS */}
      {/* ===================================== */}

      <div className="space-y-6">

        {filteredOrders.length === 0 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-10 text-center text-gray-400">
            No orders found.
          </div>
        )}

        {filteredOrders.map(
          (order) => (

            <div
              key={order.id}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6"
            >

              {/* ================================= */}
              {/* ORDER HEADER */}
              {/* ================================= */}

              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

                <div>

                  <div className="flex flex-wrap items-center gap-3">

                    <h2 className="text-2xl font-bold">
                      Table #{order.table}
                    </h2>

                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusClass(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>

                  </div>

                  <p className="text-gray-300 mt-2">
                    {order.customerName}
                  </p>

                  {order.phone && (
                    <p className="text-sm text-gray-500 mt-1">
                      📞 {order.phone}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">

                    <span>
                      🕒{" "}
                      {new Date(
                        order.createdAt
                      ).toLocaleString()}
                    </span>

                    <span>
                      ⏱{" "}
                      {getOrderAge(
                        order.createdAt
                      )}
                    </span>

                  </div>

                </div>

                <div className="lg:text-right">

                  <p className="text-gray-400 text-sm">
                    Order Total
                  </p>

                  <p className="text-3xl font-bold text-yellow-400">
                    ₹{order.total}
                  </p>

                </div>

              </div>

              {/* ================================= */}
              {/* ITEMS */}
              {/* ================================= */}

              <div className="border-t border-zinc-800 mt-6 pt-6">

                <h3 className="font-semibold text-lg mb-3">
                  Ordered Items
                </h3>

                <div className="space-y-3">

                  {order.items.map(
                    (item) => (

                      <div
                        key={item.id}
                        className="flex justify-between items-center bg-zinc-800 rounded-xl px-4 py-3"
                      >

                        <div>

                          <p className="font-semibold">
                            {item.name}
                          </p>

                          <p className="text-sm text-gray-400">
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
              {/* BATCHES */}
              {/* ================================= */}

              {order.batches &&
                order.batches.length >
                  0 && (

                  <div className="border-t border-zinc-800 mt-6 pt-6">

                    <h3 className="font-semibold text-lg mb-3">
                      Order Batches
                    </h3>

                    <div className="space-y-3">

                      {order.batches.map(
                        (batch, index) => (

                          <div
                            key={
                              batch.id
                            }
                            className="bg-zinc-800 rounded-xl p-4"
                          >

                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">

                              <div>

                                <p className="font-semibold">
                                  Batch{" "}
                                  {index + 1}
                                </p>

                                <p className="text-sm text-gray-500 mt-1">
                                  {new Date(
                                    batch.createdAt
                                  ).toLocaleString()}
                                </p>

                              </div>

                              <span
                                className={`px-3 py-1 rounded-full text-sm font-semibold w-fit ${getStatusClass(
                                  batch.status
                                )}`}
                              >
                                {
                                  batch.status
                                }
                              </span>

                            </div>

                            <div className="mt-3 space-y-2">

                              {batch.items.map(
                                (item) => (

                                  <div
                                    key={
                                      item.id
                                    }
                                    className="flex justify-between text-sm text-gray-300"
                                  >

                                    <span>
                                      {
                                        item.quantity
                                      }{" "}
                                      ×{" "}
                                      {
                                        item.name
                                      }
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
                <div className="mt-6 rounded-xl bg-zinc-800 p-4">

                  <p className="text-sm text-gray-400 mb-1">
                    Special Instructions
                  </p>

                  <p className="text-gray-200">
                    {order.instructions}
                  </p>

                </div>
              )}

              {/* ================================= */}
              {/* ACTIONS */}
              {/* ================================= */}

              <div className="border-t border-zinc-800 mt-6 pt-6">

                <p className="text-sm text-gray-500 mb-3">
                  Change Order Status
                </p>

                <div className="flex flex-wrap gap-3">

                  <Button
                    variant="secondary"
                    onClick={() =>
                      updateStatus(
                        order.id,
                        "Pending"
                      )
                    }
                  >
                    Pending
                  </Button>

                  <Button
                    variant="primary"
                    onClick={() =>
                      updateStatus(
                        order.id,
                        "Preparing"
                      )
                    }
                  >
                    Preparing
                  </Button>

                  <Button
                    variant="success"
                    onClick={() =>
                      updateStatus(
                        order.id,
                        "Ready"
                      )
                    }
                  >
                    Ready
                  </Button>

                  <Button
                    variant="secondary"
                    onClick={() =>
                      updateStatus(
                        order.id,
                        "Completed"
                      )
                    }
                  >
                    Completed
                  </Button>

                  <Button
                    variant="danger"
                    onClick={() =>
                      deleteOrder(
                        order.id
                      )
                    }
                  >
                    Delete
                  </Button>

                </div>

              </div>

            </div>

          )
        )}

      </div>

    </AdminLayout>
  );
}

export default OrdersManagement;