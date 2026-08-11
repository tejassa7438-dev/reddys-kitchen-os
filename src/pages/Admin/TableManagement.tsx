import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import {
  Table2,
  Clock3,
  User,
  IndianRupee,
  Package,
  CheckCircle,
  CreditCard,
} from "lucide-react";

import AdminLayout from "../../components/admin/AdminLayout";
import Loading from "../../components/ui/Loading";

import { orderService } from "../../services/orderService";

import type { Order } from "../../types/order";

type TableStatus =
  | "Available"
  | "Pending"
  | "Preparing"
  | "Ready"
  | "Payment Pending"
  | "Paid";

type TableInfo = {
  table: number;
  status: TableStatus;
  order: Order | null;
};

function TableManagement() {
  const navigate =
    useNavigate();

  const [orders, setOrders] =
    useState<Order[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [clearingTable, setClearingTable] =
    useState<number | null>(null);

  // =========================================
  // TABLE COUNT
  // =========================================

  const totalTables = 12;

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
  // BUILD TABLE STATUS
  // =========================================

  const tables = useMemo(() => {
    const result: TableInfo[] = [];

    for (
      let tableNumber = 1;
      tableNumber <= totalTables;
      tableNumber++
    ) {
      const activeOrders =
        orders.filter(
          (order) =>
            Number(order.table) ===
              tableNumber &&
            (
              order.status !==
                "Completed" ||
              order.paymentStatus !==
                "Paid"
            )
        );

      const latestOrder =
        activeOrders.length > 0
          ? [...activeOrders].sort(
              (a, b) =>
                new Date(
                  b.createdAt
                ).getTime() -
                new Date(
                  a.createdAt
                ).getTime()
            )[0]
          : null;

      let tableStatus:
        TableStatus =
        "Available";

      if (latestOrder) {

        // Payment completed is the final state.
        if (
          latestOrder.paymentStatus ===
          "Paid"
        ) {
          tableStatus =
            "Paid";
        }

        // Kitchen finished the order,
        // but payment is still pending.
        else if (
          latestOrder.status ===
          "Completed"
        ) {
          tableStatus =
            "Payment Pending";
        }

        else if (
          latestOrder.status ===
          "Pending"
        ) {
          tableStatus =
            "Pending";
        }

        else if (
          latestOrder.status ===
          "Preparing"
        ) {
          tableStatus =
            "Preparing";
        }

        else if (
          latestOrder.status ===
          "Ready"
        ) {
          tableStatus =
            "Ready";
        }
      }

      result.push({
        table: tableNumber,
        status: tableStatus,
        order: latestOrder,
      });
    }

    return result;
  }, [orders]);

  // =========================================
  // COUNTS
  // =========================================

  const counts =
    useMemo(() => {
      return {
        available:
          tables.filter(
            (table) =>
              table.status ===
              "Available"
          ).length,

        pending:
          tables.filter(
            (table) =>
              table.status ===
              "Pending"
          ).length,

        preparing:
          tables.filter(
            (table) =>
              table.status ===
              "Preparing"
          ).length,

        ready:
          tables.filter(
            (table) =>
              table.status ===
              "Ready"
          ).length,

        paymentPending:
          tables.filter(
            (table) =>
              table.status ===
              "Payment Pending"
          ).length,

        paid:
          tables.filter(
            (table) =>
              table.status ===
              "Paid"
          ).length,
      };
    }, [tables]);

  // =========================================
  // STATUS COLORS
  // =========================================

  function getStatusClass(
    status: TableStatus
  ) {
    switch (status) {

      case "Available":
        return {
          card:
            "border-green-700/40 bg-green-950/20",

          badge:
            "bg-green-600 text-white",

          icon:
            "bg-green-600/20 text-green-400",
        };

      case "Pending":
        return {
          card:
            "border-yellow-700/40 bg-yellow-950/20",

          badge:
            "bg-yellow-600 text-black",

          icon:
            "bg-yellow-600/20 text-yellow-400",
        };

      case "Preparing":
        return {
          card:
            "border-orange-700/40 bg-orange-950/20",

          badge:
            "bg-orange-600 text-white",

          icon:
            "bg-orange-600/20 text-orange-400",
        };

      case "Ready":
        return {
          card:
            "border-blue-700/40 bg-blue-950/20",

          badge:
            "bg-blue-600 text-white",

          icon:
            "bg-blue-600/20 text-blue-400",
        };

      case "Payment Pending":
        return {
          card:
            "border-yellow-700/40 bg-yellow-950/20",

          badge:
            "bg-yellow-600 text-black",

          icon:
            "bg-yellow-600/20 text-yellow-400",
        };

      case "Paid":
        return {
          card:
            "border-purple-700/40 bg-purple-950/20",

          badge:
            "bg-purple-600 text-white",

          icon:
            "bg-purple-600/20 text-purple-400",
        };
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

    const minutes =
      Math.floor(
        difference / 60000
      );

    if (minutes < 1) {
      return "Just now";
    }

    if (minutes < 60) {
      return `${minutes} min ago`;
    }

    const hours =
      Math.floor(
        minutes / 60
      );

    const remaining =
      minutes % 60;

    if (hours < 24) {
      return `${hours}h ${remaining}m ago`;
    }

    const days =
      Math.floor(
        hours / 24
      );

    return `${days}d ago`;
  }

  // =========================================
  // OPEN ORDER
  // =========================================

  function openOrder(
    order: Order
  ) {
    navigate(
      `/admin/orders?order=${order.id}`
    );
  }

  // =========================================
  // GO TO BILLING
  // =========================================

  function goToBilling() {
    navigate(
      "/admin/billing"
    );
  }

  // =========================================
  // CLEAR TABLE
  // =========================================

  async function clearTable(
    tableNumber: number
  ) {

    const confirmed =
      window.confirm(
        `Clear Table ${tableNumber}?\n\nThis will complete the paid order and make the table available.`
      );

    if (!confirmed) {
      return;
    }

    try {

      setClearingTable(
        tableNumber
      );

      await orderService.clearTable(
        tableNumber
      );

      toast.success(
        `Table ${tableNumber} is now available`
      );

    } catch (error) {

      console.error(
        "Clear table error:",
        error
      );

      if (
        error instanceof Error
      ) {
        toast.error(
          error.message
        );
      } else {
        toast.error(
          "Failed to clear table"
        );
      }

    } finally {

      setClearingTable(null);
    }
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
    <AdminLayout title="Table Management">

      {/* =================================== */}
      {/* HEADER */}
      {/* =================================== */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-8">

        <div>

          <h1 className="text-3xl font-bold">
            Table Settlement
          </h1>

          <p className="text-gray-400 mt-2">
            Manage all 12 restaurant
            tables and settle completed
            bills.
          </p>

        </div>

        <div className="flex items-center gap-2 text-sm text-gray-500">

          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />

          Live

        </div>

      </div>

      {/* =================================== */}
      {/* SUMMARY */}
      {/* =================================== */}

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">

        {/* Available */}

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">

          <p className="text-gray-400">
            Available
          </p>

          <p className="text-3xl font-bold text-green-400 mt-2">
            {counts.available}
          </p>

        </div>

        {/* Pending */}

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">

          <p className="text-gray-400">
            Pending
          </p>

          <p className="text-3xl font-bold text-yellow-400 mt-2">
            {counts.pending}
          </p>

        </div>

        {/* Preparing */}

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">

          <p className="text-gray-400">
            Preparing
          </p>

          <p className="text-3xl font-bold text-orange-400 mt-2">
            {counts.preparing}
          </p>

        </div>

        {/* Ready */}

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">

          <p className="text-gray-400">
            Ready
          </p>

          <p className="text-3xl font-bold text-blue-400 mt-2">
            {counts.ready}
          </p>

        </div>

        {/* Payment Pending */}

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">

          <p className="text-gray-400">
            Payment Pending
          </p>

          <p className="text-3xl font-bold text-yellow-400 mt-2">
            {counts.paymentPending}
          </p>

        </div>

        {/* Paid */}

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">

          <p className="text-gray-400">
            Paid / Clear
          </p>

          <p className="text-3xl font-bold text-purple-400 mt-2">
            {counts.paid}
          </p>

        </div>

      </div>

      {/* =================================== */}
      {/* LEGEND */}
      {/* =================================== */}

      <div className="flex flex-wrap gap-4 mb-6">

        <div className="flex items-center gap-2 text-sm text-gray-400">

          <span className="w-3 h-3 rounded-full bg-green-500" />

          Available

        </div>

        <div className="flex items-center gap-2 text-sm text-gray-400">

          <span className="w-3 h-3 rounded-full bg-yellow-500" />

          Order Pending

        </div>

        <div className="flex items-center gap-2 text-sm text-gray-400">

          <span className="w-3 h-3 rounded-full bg-orange-500" />

          Preparing

        </div>

        <div className="flex items-center gap-2 text-sm text-gray-400">

          <span className="w-3 h-3 rounded-full bg-blue-500" />

          Ready

        </div>

        <div className="flex items-center gap-2 text-sm text-gray-400">

          <span className="w-3 h-3 rounded-full bg-yellow-500" />

          Payment Pending

        </div>

        <div className="flex items-center gap-2 text-sm text-gray-400">

          <span className="w-3 h-3 rounded-full bg-purple-500" />

          Paid / Ready to Clear

        </div>

      </div>

      {/* =================================== */}
      {/* TABLE GRID */}
      {/* =================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">

        {tables.map((table) => {

          const colors =
            getStatusClass(
              table.status
            );

          const order =
            table.order;

          const itemCount =
            order
              ? order.items.reduce(
                  (
                    total,
                    item
                  ) =>
                    total +
                    item.quantity,
                  0
                )
              : 0;

          return (

            <div
              key={table.table}
              className={`border rounded-2xl p-5 transition ${colors.card}`}
            >

              {/* ================================= */}
              {/* TABLE HEADER */}
              {/* ================================= */}

              <div className="flex items-start justify-between gap-3">

                <div className="flex items-center gap-3">

                  <div
                    className={`p-3 rounded-xl ${colors.icon}`}
                  >

                    <Table2
                      size={24}
                    />

                  </div>

                  <div>

                    <h2 className="text-2xl font-bold">
                      Table #{table.table}
                    </h2>

                    <p className="text-sm text-gray-500">
                      Restaurant Table
                    </p>

                  </div>

                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${colors.badge}`}
                >
                  {table.status ===
                  "Paid"
                    ? "Paid"
                    : table.status}
                </span>

              </div>

              {/* ================================= */}
              {/* AVAILABLE */}
              {/* ================================= */}

              {!order && (

                <div className="mt-8 text-center py-5">

                  <div className="text-4xl mb-3">
                    🟢
                  </div>

                  <p className="text-green-400 font-semibold">
                    Table Available
                  </p>

                  <p className="text-gray-500 text-sm mt-1">
                    Ready for customers
                  </p>

                </div>

              )}

              {/* ================================= */}
              {/* ACTIVE ORDER */}
              {/* ================================= */}

              {order && (

                <div className="mt-6">

                  {/* Customer */}

                  <div className="flex items-center gap-2 text-gray-300">

                    <User
                      size={17}
                      className="text-gray-500"
                    />

                    <span>
                      {order.customerName}
                    </span>

                  </div>

                  {/* Total */}

                  <div className="flex items-center gap-2 mt-3 text-gray-300">

                    <IndianRupee
                      size={17}
                      className="text-yellow-400"
                    />

                    <span>
                      ₹{order.total}
                    </span>

                  </div>

                  {/* Items */}

                  <div className="flex items-center gap-2 mt-3 text-gray-300">

                    <Package
                      size={17}
                      className="text-blue-400"
                    />

                    <span>
                      {itemCount}{" "}
                      item
                      {itemCount ===
                      1
                        ? ""
                        : "s"}
                    </span>

                  </div>

                  {/* Order Age */}

                  <div className="flex items-center gap-2 mt-3 text-gray-500 text-sm">

                    <Clock3
                      size={16}
                    />

                    <span>
                      {getOrderAge(
                        order.createdAt
                      )}
                    </span>

                  </div>

                  {/* ================================= */}
                  {/* PAYMENT PENDING NOTICE */}

                  {table.status ===
                    "Payment Pending" && (

                    <div className="mt-5 bg-yellow-950/40 border border-yellow-800 rounded-xl p-4">

                      <div className="flex items-center gap-2 text-yellow-400 font-semibold">

                        <CreditCard
                          size={19}
                        />

                        Payment Pending

                      </div>

                      <p className="text-gray-400 text-sm mt-2">
                        Order served. Collect ₹
                        {order.total} from the customer.
                      </p>

                    </div>

                  )}

                  {/* PAID NOTICE */}

                  {table.status ===
                    "Paid" && (

                    <div className="mt-5 bg-purple-950/40 border border-purple-800 rounded-xl p-4">

                      <div className="flex items-center gap-2 text-purple-400 font-semibold">

                        <CheckCircle
                          size={19}
                        />

                        Payment Completed

                      </div>

                      <p className="text-gray-400 text-sm mt-2">

                        {order.paymentMethod
                          ? `${order.paymentMethod} payment`
                          : "Payment completed"}

                      </p>

                    </div>

                  )}

                  {/* ACTIONS */}
                  {/* ================================= */}

                  <div className="mt-5 space-y-2">

                    {/* VIEW ORDER */}

                    <button
                      onClick={() =>
                        openOrder(
                          order
                        )
                      }
                      className="w-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl py-3 font-semibold transition"
                    >
                      View Order
                    </button>

                    {/* PAYMENT */}

                    {order.paymentStatus !==
                      "Paid" && (

                      <button
                        onClick={
                          goToBilling
                        }
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 rounded-xl py-3 font-semibold transition"
                      >

                        <CreditCard
                          size={18}
                        />

                        Go to Billing

                      </button>

                    )}

                    {/* CLEAR TABLE */}

                    {order.paymentStatus ===
                      "Paid" && (

                      <button
                        onClick={() =>
                          clearTable(
                            table.table
                          )
                        }
                        disabled={
                          clearingTable ===
                          table.table
                        }
                        className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-zinc-700 disabled:text-gray-500 rounded-xl py-3 font-semibold transition"
                      >

                        <CheckCircle
                          size={18}
                        />

                        {clearingTable ===
                        table.table
                          ? "Clearing..."
                          : "Clear Table"}

                      </button>

                    )}

                  </div>

                </div>

              )}

            </div>

          );
        })}

      </div>

    </AdminLayout>
  );
}

export default TableManagement;