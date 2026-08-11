import { useEffect, useMemo, useState } from "react";

import {
  IndianRupee,
  ClipboardList,
  TrendingUp,
  Trophy,
  Table2,
  CalendarDays,
  Banknote,
  Smartphone,
} from "lucide-react";

import AdminLayout from "../../components/admin/AdminLayout";
import Loading from "../../components/ui/Loading";

import { orderService } from "../../services/orderService";

import type { Order } from "../../types/order";

type ReportRange =
  | "Today"
  | "7 Days"
  | "30 Days";

function SalesReports() {
  const [orders, setOrders] =
    useState<Order[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [range, setRange] =
    useState<ReportRange>("Today");

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
  // REPORT DATA
  // =========================================

  const report = useMemo(() => {
    const now = new Date();

    const todayStart =
      new Date(now);

    todayStart.setHours(
      0,
      0,
      0,
      0
    );

    let startDate =
      new Date(todayStart);

    if (range === "7 Days") {
      startDate.setDate(
        startDate.getDate() - 6
      );
    }

    if (range === "30 Days") {
      startDate.setDate(
        startDate.getDate() - 29
      );
    }

    // =======================================
    // ORDERS IN RANGE
    // =======================================

    const rangeOrders =
      orders.filter((order) => {
        const orderDate =
          new Date(
            order.createdAt
          );

        return (
          orderDate >= startDate &&
          orderDate <= now
        );
      });

    // =======================================
    // PAID ORDERS
    // =======================================

    const paidOrders =
      rangeOrders.filter(
        (order) =>
          order.paymentStatus ===
          "Paid"
      );

    // =======================================
    // COMPLETED ORDERS
    // =======================================

    const completedOrders =
      rangeOrders.filter(
        (order) =>
          order.status ===
          "Completed"
      );

    // =======================================
    // REVENUE
    // =======================================

    const revenue =
      paidOrders.reduce(
        (sum, order) =>
          sum + order.total,
        0
      );

    // =======================================
    // CASH REVENUE
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
    // UPI REVENUE
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
    // PAYMENT COUNTS
    // =======================================

    const cashPayments =
      paidOrders.filter(
        (order) =>
          order.paymentMethod ===
          "Cash"
      ).length;

    const upiPayments =
      paidOrders.filter(
        (order) =>
          order.paymentMethod ===
          "UPI"
      ).length;

    // =======================================
    // AVERAGE ORDER VALUE
    // =======================================

    const averageOrder =
      paidOrders.length > 0
        ? Math.round(
            revenue /
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

            itemSales[
              item.id
            ].quantity +=
              item.quantity;

            itemSales[
              item.id
            ].revenue +=
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
        .slice(0, 10);

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

        tableSales[
          table
        ].orders += 1;

        tableSales[
          table
        ].revenue +=
          order.total;

      }
    );

    const tablePerformance =
      Object.values(tableSales)
        .sort(
          (a, b) =>
            b.revenue -
            a.revenue
        )
        .slice(0, 12);

    // =======================================
    // DAILY REPORT
    // =======================================

    const dailyData: Record<
      string,
      {
        date: string;
        revenue: number;
        orders: number;
      }
    > = {};

    paidOrders.forEach(
      (order) => {

        const date =
          new Date(
            order.createdAt
          );

        const key =
          date
            .toISOString()
            .split("T")[0];

        if (
          !dailyData[key]
        ) {
          dailyData[key] = {
            date: key,
            revenue: 0,
            orders: 0,
          };
        }

        dailyData[
          key
        ].revenue +=
          order.total;

        dailyData[
          key
        ].orders += 1;

      }
    );

    const dailyReport =
      Object.values(dailyData)
        .sort(
          (a, b) =>
            a.date.localeCompare(
              b.date
            )
        );

    // =======================================
    // ACTIVE ORDERS
    // =======================================

    const activeOrders =
      rangeOrders.filter(
        (order) =>
          order.status !==
          "Completed"
      ).length;

    // =======================================
    // UNPAID ORDERS
    // =======================================

    const unpaidOrders =
      rangeOrders.filter(
        (order) =>
          order.paymentStatus !==
          "Paid"
      ).length;

    const paymentPendingOrders =
      rangeOrders.filter(
        (order) =>
          order.paymentStatus !==
          "Paid"
      );

    const paymentPendingAmount =
      paymentPendingOrders.reduce(
        (sum, order) =>
          sum + order.total,
        0
      );

    // Only Cash and UPI are valid payment methods
    // for this restaurant. This catches paid orders
    // whose payment method was not recorded correctly.
    const unclassifiedPaidOrders =
      paidOrders.filter(
        (order) =>
          order.paymentMethod !==
            "Cash" &&
          order.paymentMethod !==
            "UPI"
      );

    const unclassifiedPaidRevenue =
      unclassifiedPaidOrders.reduce(
        (sum, order) =>
          sum + order.total,
        0
      );

    return {
      rangeOrders,
      paidOrders,
      completedOrders,

      revenue,

      cashRevenue,
      upiRevenue,

      cashPayments,
      upiPayments,

      averageOrder,

      bestSellers,

      tablePerformance,

      dailyReport,

      activeOrders,

      unpaidOrders,
      paymentPendingOrders,
      paymentPendingAmount,

      unclassifiedPaidOrders,
      unclassifiedPaidRevenue,
    };
  }, [orders, range]);

  // =========================================
  // FORMAT DATE
  // =========================================

  const formatDate = (
    dateString: string
  ) => {

    const date =
      new Date(
        `${dateString}T00:00:00`
      );

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
      }
    );
  };

  // =========================================
  // MAX DAILY REVENUE
  // =========================================

  const maxDailyRevenue =
    Math.max(
      ...report.dailyReport.map(
        (day) =>
          day.revenue
      ),
      1
    );

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
    <AdminLayout title="Sales Reports">

      {/* ===================================== */}
      {/* HEADER */}
      {/* ===================================== */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-8">

        <div>

          <h1 className="text-3xl font-bold">
            Sales Reports
          </h1>

          <p className="text-gray-400 mt-2">
            Track paid revenue and
            restaurant performance.
          </p>

        </div>

        {/* RANGE */}

        <div className="flex bg-zinc-900 border border-zinc-800 rounded-xl p-1">

          {(
            [
              "Today",
              "7 Days",
              "30 Days",
            ] as ReportRange[]
          ).map(
            (option) => (

              <button
                key={option}
                onClick={() =>
                  setRange(
                    option
                  )
                }
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  range === option
                    ? "bg-red-600 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {option}
              </button>

            )
          )}

        </div>

      </div>

      {/* ===================================== */}
      {/* SUMMARY */}
      {/* ===================================== */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-5">

        {/* REVENUE */}

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-gray-400">
                Paid Revenue
              </p>

              <p className="text-3xl font-bold text-green-400 mt-2">
                ₹{report.revenue}
              </p>

            </div>

            <div className="bg-green-600/20 p-3 rounded-xl">

              <IndianRupee
                className="text-green-400"
              />

            </div>

          </div>

        </div>

        {/* PAID BILLS */}

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-gray-400">
                Paid Bills
              </p>

              <p className="text-3xl font-bold text-blue-400 mt-2">
                {
                  report.paidOrders
                    .length
                }
              </p>

            </div>

            <div className="bg-blue-600/20 p-3 rounded-xl">

              <ClipboardList
                className="text-blue-400"
              />

            </div>

          </div>

        </div>

        {/* AVERAGE */}

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-gray-400">
                Average Bill
              </p>

              <p className="text-3xl font-bold text-yellow-400 mt-2">
                ₹{report.averageOrder}
              </p>

            </div>

            <div className="bg-yellow-600/20 p-3 rounded-xl">

              <TrendingUp
                className="text-yellow-400"
              />

            </div>

          </div>

        </div>

        {/* PAYMENT PENDING */}

        <div className="bg-zinc-900 border border-yellow-800/50 rounded-2xl p-6">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-gray-400">
                Payment Pending
              </p>

              <p className="text-3xl font-bold text-yellow-400 mt-2">
                ₹{report.paymentPendingAmount}
              </p>

              <p className="text-sm text-gray-500 mt-1">
                {report.paymentPendingOrders.length} unpaid order
                {report.paymentPendingOrders.length === 1
                  ? ""
                  : "s"}
              </p>

            </div>

            <div className="bg-yellow-600/20 p-3 rounded-xl">

              <IndianRupee
                className="text-yellow-400"
              />

            </div>

          </div>

        </div>

        {/* UNPAID */}

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-gray-400">
                Unpaid Orders
              </p>

              <p className="text-3xl font-bold text-orange-400 mt-2">
                {report.unpaidOrders}
              </p>

            </div>

            <div className="bg-orange-600/20 p-3 rounded-xl">

              <ClipboardList
                className="text-orange-400"
              />

            </div>

          </div>

        </div>

      </div>

      {/* ===================================== */}
      {/* PAYMENT BREAKDOWN */}
      {/* ===================================== */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">

        {/* CASH */}

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">

          <div className="flex items-center gap-4">

            <div className="bg-green-600/20 p-4 rounded-xl">

              <Banknote
                className="text-green-400"
                size={28}
              />

            </div>

            <div>

              <p className="text-gray-400">
                Cash Revenue
              </p>

              <p className="text-3xl font-bold text-green-400">
                ₹{report.cashRevenue}
              </p>

              <p className="text-sm text-gray-500 mt-1">
                {report.cashPayments} paid bill
                {report.cashPayments ===
                1
                  ? ""
                  : "s"}
              </p>

            </div>

          </div>

        </div>

        {/* UPI */}

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">

          <div className="flex items-center gap-4">

            <div className="bg-blue-600/20 p-4 rounded-xl">

              <Smartphone
                className="text-blue-400"
                size={28}
              />

            </div>

            <div>

              <p className="text-gray-400">
                UPI Revenue
              </p>

              <p className="text-3xl font-bold text-blue-400">
                ₹{report.upiRevenue}
              </p>

              <p className="text-sm text-gray-500 mt-1">
                {report.upiPayments} paid bill
                {report.upiPayments ===
                1
                  ? ""
                  : "s"}
              </p>

            </div>

          </div>

        </div>

      </div>

      {/* ===================================== */}
      {/* PAYMENT INTEGRITY */}
      {/* ===================================== */}

      {report.unclassifiedPaidOrders.length > 0 && (

        <div className="mt-6 bg-orange-950/30 border border-orange-800/50 rounded-2xl p-5">

          <div className="flex items-start gap-3">

            <div className="bg-orange-600/20 p-3 rounded-xl">

              <Banknote
                className="text-orange-400"
              />

            </div>

            <div>

              <h3 className="font-bold text-orange-300">
                Payment Method Needs Attention
              </h3>

              <p className="text-sm text-gray-400 mt-1">
                {report.unclassifiedPaidOrders.length} paid order
                {report.unclassifiedPaidOrders.length === 1
                  ? ""
                  : "s"} worth ₹
                {report.unclassifiedPaidRevenue} do not have
                Cash or UPI recorded as the payment method.
              </p>

            </div>

          </div>

        </div>

      )}

      {/* ===================================== */}
      {/* DAILY SALES */}
      {/* ===================================== */}

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mt-8">

        <div className="flex items-center gap-3 mb-6">

          <div className="bg-green-600/20 p-3 rounded-xl">

            <CalendarDays
              className="text-green-400"
            />

          </div>

          <div>

            <h2 className="text-2xl font-bold">
              Daily Sales
            </h2>

            <p className="text-gray-500 text-sm">
              Paid revenue by day for{" "}
              {range.toLowerCase()}
            </p>

          </div>

        </div>

        {report.dailyReport.length ===
        0 ? (

          <div className="text-center py-10 text-gray-500">
            No paid sales found for
            this period.
          </div>

        ) : (

          <div className="space-y-5">

            {report.dailyReport.map(
              (day) => {

                const width =
                  (day.revenue /
                    maxDailyRevenue) *
                  100;

                return (

                  <div
                    key={day.date}
                  >

                    <div className="flex justify-between items-center mb-2">

                      <span className="font-semibold">
                        {formatDate(
                          day.date
                        )}
                      </span>

                      <div className="text-right">

                        <span className="text-green-400 font-bold">
                          ₹{day.revenue}
                        </span>

                        <span className="text-gray-500 text-sm ml-3">
                          {day.orders} paid
                          order
                          {day.orders ===
                          1
                            ? ""
                            : "s"}
                        </span>

                      </div>

                    </div>

                    <div className="h-4 bg-zinc-800 rounded-full overflow-hidden">

                      <div
                        className="h-full bg-green-600 rounded-full transition-all duration-500"
                        style={{
                          width: `${width}%`,
                        }}
                      />

                    </div>

                  </div>

                );
              }
            )}

          </div>

        )}

      </div>

      {/* ===================================== */}
      {/* BEST SELLERS */}
      {/* ===================================== */}

      <div className="grid lg:grid-cols-2 gap-6 mt-8">

        {/* BEST SELLING ITEMS */}

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">

          <div className="flex items-center gap-3 mb-6">

            <div className="bg-yellow-600/20 p-3 rounded-xl">

              <Trophy
                className="text-yellow-400"
              />

            </div>

            <div>

              <h2 className="text-2xl font-bold">
                Best-Selling Items
              </h2>

              <p className="text-gray-500 text-sm">
                Based on paid orders
              </p>

            </div>

          </div>

          {report.bestSellers.length ===
          0 ? (

            <div className="text-center py-10 text-gray-500">
              No paid sales yet.
            </div>

          ) : (

            <div className="space-y-3">

              {report.bestSellers.map(
                (item, index) => (

                  <div
                    key={item.name}
                    className="flex items-center gap-4 bg-zinc-800 rounded-xl p-4"
                  >

                    <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center font-bold">
                      {index + 1}
                    </div>

                    <div className="flex-1">

                      <p className="font-semibold">
                        {item.name}
                      </p>

                      <p className="text-sm text-gray-500">
                        {item.quantity}{" "}
                        sold
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

        {/* =================================== */}
        {/* TABLE PERFORMANCE */}
        {/* =================================== */}

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">

          <div className="flex items-center gap-3 mb-6">

            <div className="bg-blue-600/20 p-3 rounded-xl">

              <Table2
                className="text-blue-400"
              />

            </div>

            <div>

              <h2 className="text-2xl font-bold">
                Table Performance
              </h2>

              <p className="text-gray-500 text-sm">
                Paid revenue by table
              </p>

            </div>

          </div>

          {report.tablePerformance
            .length === 0 ? (

            <div className="text-center py-10 text-gray-500">
              No paid sales yet.
            </div>

          ) : (

            <div className="space-y-3">

              {report.tablePerformance.map(
                (table, index) => (

                  <div
                    key={table.table}
                    className="flex items-center gap-4 bg-zinc-800 rounded-xl p-4"
                  >

                    <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center font-bold">
                      {index + 1}
                    </div>

                    <div className="flex-1">

                      <p className="font-semibold">
                        Table #
                        {table.table}
                      </p>

                      <p className="text-sm text-gray-500">
                        {table.orders}{" "}
                        paid order
                        {table.orders ===
                        1
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
      {/* ORDER BREAKDOWN */}
      {/* ===================================== */}

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mt-8">

        <h2 className="text-2xl font-bold mb-6">
          Order Breakdown
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-5">

          {/* TOTAL */}

          <div className="bg-zinc-800 rounded-xl p-5">

            <p className="text-gray-400">
              Total Orders
            </p>

            <p className="text-3xl font-bold mt-2">
              {
                report.rangeOrders
                  .length
              }
            </p>

          </div>

          {/* PAID */}

          <div className="bg-zinc-800 rounded-xl p-5">

            <p className="text-gray-400">
              Paid
            </p>

            <p className="text-3xl font-bold text-green-400 mt-2">
              {
                report.paidOrders
                  .length
              }
            </p>

          </div>

          {/* COMPLETED */}

          <div className="bg-zinc-800 rounded-xl p-5">

            <p className="text-gray-400">
              Completed
            </p>

            <p className="text-3xl font-bold text-blue-400 mt-2">
              {
                report.completedOrders
                  .length
              }
            </p>

          </div>

          {/* PAYMENT PENDING */}

          <div className="bg-zinc-800 rounded-xl p-5">

            <p className="text-gray-400">
              Payment Pending
            </p>

            <p className="text-3xl font-bold text-yellow-400 mt-2">
              {report.paymentPendingOrders.length}
            </p>

            <p className="text-sm text-gray-500 mt-1">
              ₹{report.paymentPendingAmount} to collect
            </p>

          </div>

          {/* ACTIVE */}

          <div className="bg-zinc-800 rounded-xl p-5">

            <p className="text-gray-400">
              Still Active
            </p>

            <p className="text-3xl font-bold text-orange-400 mt-2">
              {report.activeOrders}
            </p>

          </div>

        </div>

      </div>

    </AdminLayout>
  );
}

export default SalesReports;