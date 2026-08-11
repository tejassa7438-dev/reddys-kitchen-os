import { useEffect, useMemo, useState } from "react";

import {
  UtensilsCrossed,
  ClipboardList,
  Clock3,
  ChefHat,
  CheckCircle,
  IndianRupee,
  TrendingUp,
  Trophy,
  Table2,
  CreditCard,
  AlertCircle,
} from "lucide-react";

import AdminLayout from "../../components/admin/AdminLayout";
import Loading from "../../components/ui/Loading";
import StatCard from "../../components/ui/StatCard";

import { menuService } from "../../services/menuService";
import { orderService } from "../../services/orderService";

import type { MenuItem } from "../../types/menu";
import type { Order } from "../../types/order";

function AdminDashboard() {
  const [menu, setMenu] =
    useState<MenuItem[]>([]);

  const [orders, setOrders] =
    useState<Order[]>([]);

  const [loading, setLoading] =
    useState(true);

  // =========================================
  // LIVE MENU + ORDERS
  // =========================================

  useEffect(() => {
    const unsubMenu =
      menuService.subscribe((items) => {
        setMenu(items);
      });

    const unsubOrders =
      orderService.subscribeToOrders(
        (items) => {
          setOrders(items);
          setLoading(false);
        }
      );

    return () => {
      unsubMenu();
      unsubOrders();
    };
  }, []);

  // =========================================
  // ANALYTICS
  // =========================================

  const analytics = useMemo(() => {
    const now = new Date();

    const todayStart =
      new Date(now);

    todayStart.setHours(
      0,
      0,
      0,
      0
    );

    const todayEnd =
      new Date(now);

    todayEnd.setHours(
      23,
      59,
      59,
      999
    );

    // =======================================
    // TODAY'S ORDERS
    // =======================================

    const todayOrders =
      orders.filter((order) => {
        const date =
          new Date(
            order.createdAt
          );

        return (
          date >= todayStart &&
          date <= todayEnd
        );
      });

    // =======================================
    // PAID ORDERS
    // =======================================

    const paidOrders =
      todayOrders.filter(
        (order) =>
          order.paymentStatus ===
          "Paid"
      );

    // =======================================
    // PAYMENT PENDING
    // =======================================

    const paymentPending =
      orders.filter(
        (order) =>
          order.paymentStatus !==
          "Paid"
      );

    // =======================================
    // KITCHEN STATUS
    // =======================================

    const pending =
      orders.filter(
        (order) =>
          order.status === "Pending"
      ).length;

    const preparing =
      orders.filter(
        (order) =>
          order.status ===
          "Preparing"
      ).length;

    const ready =
      orders.filter(
        (order) =>
          order.status === "Ready"
      ).length;

    const served =
      orders.filter(
        (order) =>
          order.status ===
          "Completed"
      ).length;

    // =======================================
    // ACTIVE ORDERS
    // =======================================

    const active =
      orders.filter(
        (order) =>
          order.status !==
          "Completed"
      ).length;

    // =======================================
    // TODAY'S PAID REVENUE
    // =======================================

    const todayRevenue =
      paidOrders.reduce(
        (sum, order) =>
          sum + order.total,
        0
      );

    // =======================================
    // TODAY'S CASH
    // =======================================

    const cashRevenue =
      paidOrders
        .filter(
          (order) =>
            order.paymentMethod ===
            "Cash"
        )
        .reduce(
          (sum, order) =>
            sum + order.total,
          0
        );

    // =======================================
    // TODAY'S UPI
    // =======================================

    const upiRevenue =
      paidOrders
        .filter(
          (order) =>
            order.paymentMethod ===
            "UPI"
        )
        .reduce(
          (sum, order) =>
            sum + order.total,
          0
        );

    // =======================================
    // AVERAGE BILL
    // =======================================

    const averageOrderValue =
      paidOrders.length > 0
        ? Math.round(
            todayRevenue /
              paidOrders.length
          )
        : 0;

    // =======================================
    // BEST SELLING ITEMS
    // =======================================

    const itemSales: Record<
      string,
      {
        name: string;
        quantity: number;
        revenue: number;
      }
    > = {};

    paidOrders.forEach(
      (order) => {
        order.items.forEach(
          (item) => {
            if (
              !itemSales[item.id]
            ) {
              itemSales[item.id] = {
                name: item.name,
                quantity: 0,
                revenue: 0,
              };
            }

            itemSales[item.id]
              .quantity +=
              item.quantity;

            itemSales[item.id]
              .revenue +=
              item.price *
              item.quantity;
          }
        );
      }
    );

    const bestSellers =
      Object.values(itemSales)
        .sort(
          (a, b) =>
            b.quantity -
            a.quantity
        )
        .slice(0, 5);

    // =======================================
    // TABLE PERFORMANCE
    // =======================================

    const tableSales: Record<
      string,
      {
        table: string;
        orders: number;
        revenue: number;
      }
    > = {};

    paidOrders.forEach(
      (order) => {
        const table =
          order.table.toString();

        if (
          !tableSales[table]
        ) {
          tableSales[table] = {
            table,
            orders: 0,
            revenue: 0,
          };
        }

        tableSales[table]
          .orders += 1;

        tableSales[table]
          .revenue +=
          order.total;
      }
    );

    const topTables =
      Object.values(tableSales)
        .sort(
          (a, b) =>
            b.revenue -
            a.revenue
        )
        .slice(0, 5);

    // =======================================
    // TABLE OCCUPANCY
    // =======================================

    const occupiedTables =
      new Set(
        orders
          .filter(
            (order) =>
              order.status !==
              "Completed"
          )
          .map(
            (order) =>
              order.table
          )
      );

    // =======================================
    // RECENT ORDERS
    // =======================================

    const recent =
      [...orders]
        .sort(
          (a, b) =>
            new Date(
              b.createdAt
            ).getTime() -
            new Date(
              a.createdAt
            ).getTime()
        )
        .slice(0, 6);

    return {
      todayOrders,
      paidOrders,

      pending,
      preparing,
      ready,
      served,
      active,

      paymentPending,

      todayRevenue,
      cashRevenue,
      upiRevenue,

      averageOrderValue,

      bestSellers,
      topTables,

      occupiedTables,

      recent,
    };
  }, [orders]);

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
    <AdminLayout title="Dashboard">

      {/* ===================================== */}
      {/* HEADER */}
      {/* ===================================== */}

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-8">

        <div>

          <h1 className="text-3xl font-bold">
            Restaurant Overview
          </h1>

          <p className="text-gray-400 mt-2">
            Live overview of REDDY'S
            KITCHEN.
          </p>

        </div>

        <div className="text-sm text-gray-500">

          Live data •{" "}
          {new Date().toLocaleDateString(
            "en-IN",
            {
              weekday: "long",
              day: "numeric",
              month: "long",
            }
          )}

        </div>

      </div>

      {/* ===================================== */}
      {/* MAIN STATS */}
      {/* ===================================== */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

        <StatCard
          title="Menu Items"
          value={menu.length}
          color="bg-red-600"
          icon={<UtensilsCrossed />}
        />

        <StatCard
          title="Today's Orders"
          value={
            analytics.todayOrders
              .length
          }
          color="bg-blue-600"
          icon={<ClipboardList />}
        />

        <StatCard
          title="Today's Revenue"
          value={
            analytics.todayRevenue
          }
          color="bg-green-600"
          icon={<IndianRupee />}
        />

        <StatCard
          title="Average Paid Bill"
          value={
            analytics.averageOrderValue
          }
          color="bg-purple-600"
          icon={<TrendingUp />}
        />

      </div>

      {/* ===================================== */}
      {/* LIVE OPERATIONS */}
      {/* ===================================== */}

      <div className="mt-10">

        <div className="flex items-center justify-between mb-5">

          <div>

            <h2 className="text-2xl font-bold">
              Live Operations
            </h2>

            <p className="text-gray-500 text-sm mt-1">
              What's happening right now
            </p>

          </div>

          <a
            href="/kitchen"
            className="text-red-500 hover:text-red-400 font-semibold"
          >
            Open Kitchen →
          </a>

        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">

          {/* PENDING */}

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">

            <div className="bg-yellow-600/20 w-fit p-3 rounded-xl">

              <Clock3
                className="text-yellow-400"
              />

            </div>

            <p className="text-gray-400 mt-4">
              Pending
            </p>

            <p className="text-3xl font-bold text-yellow-400 mt-1">
              {analytics.pending}
            </p>

          </div>

          {/* PREPARING */}

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">

            <div className="bg-orange-600/20 w-fit p-3 rounded-xl">

              <ChefHat
                className="text-orange-400"
              />

            </div>

            <p className="text-gray-400 mt-4">
              Preparing
            </p>

            <p className="text-3xl font-bold text-orange-400 mt-1">
              {analytics.preparing}
            </p>

          </div>

          {/* READY */}

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">

            <div className="bg-green-600/20 w-fit p-3 rounded-xl">

              <CheckCircle
                className="text-green-400"
              />

            </div>

            <p className="text-gray-400 mt-4">
              Ready
            </p>

            <p className="text-3xl font-bold text-green-400 mt-1">
              {analytics.ready}
            </p>

          </div>

          {/* SERVED */}

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">

            <div className="bg-purple-600/20 w-fit p-3 rounded-xl">

              <CheckCircle
                className="text-purple-400"
              />

            </div>

            <p className="text-gray-400 mt-4">
              Served
            </p>

            <p className="text-3xl font-bold text-purple-400 mt-1">
              {analytics.served}
            </p>

          </div>

          {/* ACTIVE */}

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">

            <div className="bg-blue-600/20 w-fit p-3 rounded-xl">

              <ClipboardList
                className="text-blue-400"
              />

            </div>

            <p className="text-gray-400 mt-4">
              Active
            </p>

            <p className="text-3xl font-bold text-blue-400 mt-1">
              {analytics.active}
            </p>

          </div>

          {/* PAYMENT */}

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">

            <div className="bg-red-600/20 w-fit p-3 rounded-xl">

              <CreditCard
                className="text-red-400"
              />

            </div>

            <p className="text-gray-400 mt-4">
              Payment Due
            </p>

            <p className="text-3xl font-bold text-red-400 mt-1">
              {
                analytics
                  .paymentPending
                  .length
              }
            </p>

          </div>

        </div>

      </div>

      {/* ===================================== */}
      {/* TABLES + PAYMENT */}
      {/* ===================================== */}

      <div className="grid lg:grid-cols-2 gap-6 mt-8">

        {/* TABLE STATUS */}

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">

          <div className="flex items-center justify-between">

            <div>

              <h2 className="text-2xl font-bold">
                Table Status
              </h2>

              <p className="text-gray-500 text-sm mt-1">
                12 restaurant tables
              </p>

            </div>

            <Table2
              className="text-blue-400"
              size={30}
            />

          </div>

          <div className="mt-6 grid grid-cols-4 sm:grid-cols-6 gap-3">

            {Array.from(
              { length: 12 },
              (_, index) =>
                index + 1
            ).map(
              (table) => {

                const occupied =
                  analytics
                    .occupiedTables
                    .has(table);

                return (

                  <div
                    key={table}
                    className={`rounded-xl p-3 text-center border ${
                      occupied
                        ? "bg-red-600/20 border-red-700"
                        : "bg-green-600/20 border-green-700"
                    }`}
                  >

                    <div className="font-bold">
                      {table}
                    </div>

                    <div
                      className={`text-xs mt-1 ${
                        occupied
                          ? "text-red-400"
                          : "text-green-400"
                      }`}
                    >
                      {occupied
                        ? "Busy"
                        : "Free"}
                    </div>

                  </div>

                );
              }
            )}

          </div>

          <a
            href="/admin/tables"
            className="block mt-5 text-center bg-zinc-800 hover:bg-zinc-700 rounded-xl py-3 font-semibold transition"
          >
            Manage Tables
          </a>

        </div>

        {/* PAYMENT STATUS */}

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">

          <div className="flex items-center justify-between">

            <div>

              <h2 className="text-2xl font-bold">
                Payment Overview
              </h2>

              <p className="text-gray-500 text-sm mt-1">
                Today's paid revenue
              </p>

            </div>

            <CreditCard
              className="text-green-400"
              size={30}
            />

          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">

            <div className="bg-zinc-800 rounded-xl p-5">

              <p className="text-gray-400">
                Cash
              </p>

              <p className="text-2xl font-bold text-green-400 mt-2">
                ₹{analytics.cashRevenue}
              </p>

            </div>

            <div className="bg-zinc-800 rounded-xl p-5">

              <p className="text-gray-400">
                UPI
              </p>

              <p className="text-2xl font-bold text-blue-400 mt-2">
                ₹{analytics.upiRevenue}
              </p>

            </div>

          </div>

          <div className="mt-4 bg-red-950/30 border border-red-900 rounded-xl p-4">

            <div className="flex items-center gap-3">

              <AlertCircle
                className="text-red-400"
              />

              <div>

                <p className="font-semibold">
                  {analytics.paymentPending.length}{" "}
                  payment
                  {analytics.paymentPending
                    .length === 1
                    ? ""
                    : "s"} pending
                </p>

                <p className="text-sm text-gray-500">
                  Completed/served orders
                  awaiting payment
                </p>

              </div>

            </div>

          </div>

          <a
            href="/admin/billing"
            className="block mt-5 text-center bg-red-600 hover:bg-red-700 rounded-xl py-3 font-semibold transition"
          >
            Open Billing
          </a>

        </div>

      </div>

      {/* ===================================== */}
      {/* TODAY'S PERFORMANCE */}
      {/* ===================================== */}

      <div className="mt-10">

        <h2 className="text-2xl font-bold mb-5">
          Today's Performance
        </h2>

        <div className="grid md:grid-cols-3 gap-5">

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">

            <p className="text-gray-400">
              Paid Orders
            </p>

            <p className="text-4xl font-bold text-green-400 mt-2">
              {
                analytics.paidOrders
                  .length
              }
            </p>

          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">

            <p className="text-gray-400">
              Paid Revenue
            </p>

            <p className="text-4xl font-bold text-yellow-400 mt-2">
              ₹{analytics.todayRevenue}
            </p>

          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">

            <p className="text-gray-400">
              Orders Today
            </p>

            <p className="text-4xl font-bold text-blue-400 mt-2">
              {
                analytics.todayOrders
                  .length
              }
            </p>

          </div>

        </div>

      </div>

      {/* ===================================== */}
      {/* BEST SELLERS + TOP TABLES */}
      {/* ===================================== */}

      <div className="grid lg:grid-cols-2 gap-6 mt-10">

        {/* BEST SELLERS */}

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">

          <div className="flex items-center gap-3 mb-6">

            <div className="bg-yellow-600/20 p-3 rounded-xl">

              <Trophy
                className="text-yellow-400"
              />

            </div>

            <div>

              <h2 className="text-2xl font-bold">
                Best Sellers
              </h2>

              <p className="text-gray-500 text-sm">
                Based on paid orders
              </p>

            </div>

          </div>

          {analytics.bestSellers
            .length === 0 ? (

            <div className="text-center py-10 text-gray-500">
              No paid sales today.
            </div>

          ) : (

            <div className="space-y-4">

              {analytics.bestSellers.map(
                (item, index) => (

                  <div
                    key={item.name}
                    className="flex items-center gap-4 bg-zinc-800 rounded-xl p-4"
                  >

                    <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center font-bold">
                      {index + 1}
                    </div>

                    <div className="flex-1">

                      <p className="font-bold">
                        {item.name}
                      </p>

                      <p className="text-sm text-gray-500">
                        {item.quantity} sold
                      </p>

                    </div>

                    <p className="font-bold text-yellow-400">
                      ₹{item.revenue}
                    </p>

                  </div>

                )
              )}

            </div>

          )}

        </div>

        {/* TOP TABLES */}

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">

          <div className="flex items-center gap-3 mb-6">

            <div className="bg-blue-600/20 p-3 rounded-xl">

              <Table2
                className="text-blue-400"
              />

            </div>

            <div>

              <h2 className="text-2xl font-bold">
                Top Tables
              </h2>

              <p className="text-gray-500 text-sm">
                Today's paid sales
              </p>

            </div>

          </div>

          {analytics.topTables
            .length === 0 ? (

            <div className="text-center py-10 text-gray-500">
              No paid sales today.
            </div>

          ) : (

            <div className="space-y-4">

              {analytics.topTables.map(
                (table, index) => (

                  <div
                    key={table.table}
                    className="flex items-center gap-4 bg-zinc-800 rounded-xl p-4"
                  >

                    <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center font-bold">
                      {index + 1}
                    </div>

                    <div className="flex-1">

                      <p className="font-bold">
                        Table #{table.table}
                      </p>

                      <p className="text-sm text-gray-500">
                        {table.orders} paid order
                        {table.orders === 1
                          ? ""
                          : "s"}
                      </p>

                    </div>

                    <p className="font-bold text-green-400">
                      ₹{table.revenue}
                    </p>

                  </div>

                )
              )}

            </div>

          )}

        </div>

      </div>

      {/* ===================================== */}
      {/* QUICK ACTIONS */}
      {/* ===================================== */}

      <div className="mt-12">

        <h2 className="text-2xl font-bold mb-5">
          Quick Actions
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-5">

          <a
            href="/admin/menu"
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:bg-zinc-800 transition"
          >

            <h3 className="text-xl font-bold">
              🍔 Menu
            </h3>

            <p className="text-gray-400 mt-2">
              Manage menu items
            </p>

          </a>

          <a
            href="/admin/orders"
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:bg-zinc-800 transition"
          >

            <h3 className="text-xl font-bold">
              📦 Orders
            </h3>

            <p className="text-gray-400 mt-2">
              View customer orders
            </p>

          </a>

          <a
            href="/admin/billing"
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:bg-zinc-800 transition"
          >

            <h3 className="text-xl font-bold">
              💳 Billing
            </h3>

            <p className="text-gray-400 mt-2">
              Collect payments
            </p>

          </a>

          <a
            href="/admin/reports"
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:bg-zinc-800 transition"
          >

            <h3 className="text-xl font-bold">
              📊 Reports
            </h3>

            <p className="text-gray-400 mt-2">
              View sales reports
            </p>

          </a>

          <a
            href="/kitchen"
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:bg-zinc-800 transition"
          >

            <h3 className="text-xl font-bold">
              👨‍🍳 Kitchen
            </h3>

            <p className="text-gray-400 mt-2">
              Open kitchen dashboard
            </p>

          </a>

        </div>

      </div>

      {/* ===================================== */}
      {/* RECENT ORDERS */}
      {/* ===================================== */}

      <div className="mt-12">

        <div className="flex justify-between items-center mb-5">

          <h2 className="text-2xl font-bold">
            Recent Orders
          </h2>

          <a
            href="/admin/orders"
            className="text-red-500 hover:text-red-400 font-semibold"
          >
            View All →
          </a>

        </div>

        <div className="overflow-hidden rounded-2xl border border-zinc-800">

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-zinc-900">

                <tr>

                  <th className="text-left p-4">
                    Table
                  </th>

                  <th className="text-left p-4">
                    Customer
                  </th>

                  <th className="text-left p-4">
                    Total
                  </th>

                  <th className="text-left p-4">
                    Payment
                  </th>

                  <th className="text-left p-4">
                    Status
                  </th>

                </tr>

              </thead>

              <tbody>

                {analytics.recent.map(
                  (order) => (

                    <tr
                      key={order.id}
                      className="border-t border-zinc-800"
                    >

                      <td className="p-4">
                        #{order.table}
                      </td>

                      <td className="p-4">
                        {order.customerName}
                      </td>

                      <td className="p-4">
                        ₹{order.total}
                      </td>

                      <td className="p-4">

                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            order.paymentStatus ===
                            "Paid"
                              ? "bg-green-600"
                              : "bg-red-600"
                          }`}
                        >

                          {order.paymentStatus ===
                          "Paid"
                            ? "Paid"
                            : "Unpaid"}

                        </span>

                      </td>

                      <td className="p-4">

                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            order.status ===
                            "Pending"
                              ? "bg-yellow-600"
                              : order.status ===
                                "Preparing"
                              ? "bg-orange-600"
                              : order.status ===
                                "Ready"
                              ? "bg-green-600"
                              : "bg-purple-600"
                          }`}
                        >

                          {order.status ===
                          "Completed"
                            ? "Served"
                            : order.status}

                        </span>

                      </td>

                    </tr>

                  )
                )}

                {analytics.recent.length ===
                  0 && (

                  <tr>

                    <td
                      colSpan={5}
                      className="text-center p-8 text-gray-400"
                    >
                      No orders yet.
                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>

    </AdminLayout>
  );
}

export default AdminDashboard;