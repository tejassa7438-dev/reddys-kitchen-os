import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import {
  Banknote,
  Smartphone,
  CheckCircle,
  Clock,
  Printer,
} from "lucide-react";

import AdminLayout from "../../components/admin/AdminLayout";
import Loading from "../../components/ui/Loading";

import { orderService } from "../../services/orderService";

import type {
  Order,
  PaymentMethod,
} from "../../types/order";

function BillingManagement() {
  const [orders, setOrders] =
    useState<Order[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [processingOrder, setProcessingOrder] =
    useState<string | null>(null);

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
  // UNPAID ORDERS
  // =========================================

  const unpaidOrders =
    orders.filter(
      (order) =>
        order.paymentStatus !== "Paid"
    );

  // =========================================
  // PAID ORDERS
  // =========================================
  //
  // Keep paid orders visible while they
  // are still active so staff can print
  // the bill before clearing the table.
  //
  // =========================================

  const paidOrders =
    orders.filter(
      (order) =>
        order.paymentStatus === "Paid" &&
        order.status !== "Completed"
    );

  // =========================================
  // MARK PAID
  // =========================================

  async function markPaid(
    orderId: string,
    method: PaymentMethod
  ) {
    try {
      setProcessingOrder(orderId);

      await orderService.markOrderPaid(
        orderId,
        method
      );

      toast.success(
        `Payment recorded as ${method}`
      );
    } catch (error) {
      console.error(
        "Payment error:",
        error
      );

      toast.error(
        "Failed to record payment"
      );
    } finally {
      setProcessingOrder(null);
    }
  }

  // =========================================
  // MARK UNPAID
  // =========================================

  async function markUnpaid(
    orderId: string
  ) {
    try {
      setProcessingOrder(orderId);

      await orderService.markOrderUnpaid(
        orderId
      );

      toast.success(
        "Payment marked as unpaid"
      );
    } catch (error) {
      console.error(
        "Mark unpaid error:",
        error
      );

      toast.error(
        "Failed to update payment"
      );
    } finally {
      setProcessingOrder(null);
    }
  }

  // =========================================
  // PRINT BILL
  // =========================================

  function printBill(order: Order) {
    if (
      order.paymentStatus !== "Paid"
    ) {
      toast.error(
        "Please complete payment before printing the bill."
      );

      return;
    }

    const paymentMethod =
      order.paymentMethod ?? "Cash";

    const orderDate =
      new Date(
        order.createdAt
      ).toLocaleString("en-IN");

    const paidDate =
      order.paidAt
        ? new Date(
            order.paidAt
          ).toLocaleString("en-IN")
        : orderDate;

    const itemsHtml =
      order.items
        .map(
          (item) => `
            <tr>
              <td>${escapeHtml(
                item.name
              )}</td>

              <td class="center">
                ${item.quantity}
              </td>

              <td class="right">
                ₹${item.price.toFixed(2)}
              </td>

              <td class="right">
                ₹${(
                  item.price *
                  item.quantity
                ).toFixed(2)}
              </td>
            </tr>
          `
        )
        .join("");

    const printWindow =
      window.open(
        "",
        "_blank",
        "width=800,height=900"
      );

    if (!printWindow) {
      toast.error(
        "Please allow pop-ups to print the bill."
      );

      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>

      <html>

        <head>

          <title>
            REDDY'S KITCHEN - Bill
          </title>

          <meta charset="UTF-8" />

          <style>

            * {
              box-sizing: border-box;
            }

            body {
              margin: 0;
              padding: 30px;
              background: white;
              color: #111;
              font-family:
                Arial,
                Helvetica,
                sans-serif;
            }

            .receipt {
              width: 100%;
              max-width: 760px;
              margin: 0 auto;
            }

            .header {
              text-align: center;
              border-bottom: 2px solid #111;
              padding-bottom: 18px;
              margin-bottom: 18px;
            }

            .restaurant {
              font-size: 30px;
              font-weight: 800;
              letter-spacing: 1px;
            }

            .subtitle {
              margin-top: 5px;
              font-size: 14px;
              color: #555;
            }

            .paid {
              display: inline-block;
              margin-top: 12px;
              padding: 6px 18px;
              border: 2px solid #15803d;
              color: #15803d;
              font-weight: 800;
              border-radius: 20px;
              font-size: 14px;
            }

            .details {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 8px 30px;
              margin-bottom: 25px;
              font-size: 14px;
            }

            .detail-row {
              display: flex;
              justify-content: space-between;
              gap: 15px;
              padding: 4px 0;
            }

            .label {
              color: #666;
            }

            .value {
              font-weight: 600;
              text-align: right;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 15px;
            }

            th {
              border-top: 1px solid #111;
              border-bottom: 1px solid #111;
              padding: 9px 5px;
              text-align: left;
              font-size: 13px;
            }

            td {
              padding: 9px 5px;
              border-bottom: 1px solid #ddd;
              font-size: 13px;
            }

            .center {
              text-align: center;
            }

            .right {
              text-align: right;
            }

            .total-section {
              margin-top: 18px;
              border-top: 2px solid #111;
              padding-top: 12px;
            }

            .total-row {
              display: flex;
              justify-content: space-between;
              font-size: 22px;
              font-weight: 800;
            }

            .payment {
              margin-top: 18px;
              padding: 12px;
              background: #f5f5f5;
              border-radius: 8px;
              font-size: 14px;
            }

            .footer {
              text-align: center;
              margin-top: 35px;
              padding-top: 15px;
              border-top: 1px dashed #999;
              color: #555;
              font-size: 13px;
            }

            @media print {
              body {
                padding: 10px;
              }

              .receipt {
                max-width: none;
              }
            }

          </style>

        </head>

        <body>

          <div class="receipt">

            <div class="header">

              <div class="restaurant">
                🍽 REDDY'S KITCHEN
              </div>

              <div class="subtitle">
                Restaurant Bill / Receipt
              </div>

              <div class="paid">
                PAID
              </div>

            </div>

            <div class="details">

              <div class="detail-row">
                <span class="label">
                  Table
                </span>

                <span class="value">
                  #${order.table}
                </span>
              </div>

              <div class="detail-row">
                <span class="label">
                  Customer
                </span>

                <span class="value">
                  ${escapeHtml(
                    order.customerName
                  )}
                </span>
              </div>

              <div class="detail-row">
                <span class="label">
                  Order Date
                </span>

                <span class="value">
                  ${orderDate}
                </span>
              </div>

              <div class="detail-row">
                <span class="label">
                  Payment Date
                </span>

                <span class="value">
                  ${paidDate}
                </span>
              </div>

              <div class="detail-row">
                <span class="label">
                  Payment Method
                </span>

                <span class="value">
                  ${paymentMethod}
                </span>
              </div>

              <div class="detail-row">
                <span class="label">
                  Order ID
                </span>

                <span class="value">
                  ${escapeHtml(order.id)}
                </span>
              </div>

            </div>

            <table>

              <thead>

                <tr>

                  <th>
                    Item
                  </th>

                  <th class="center">
                    Qty
                  </th>

                  <th class="right">
                    Price
                  </th>

                  <th class="right">
                    Amount
                  </th>

                </tr>

              </thead>

              <tbody>
                ${itemsHtml}
              </tbody>

            </table>

            <div class="total-section">

              <div class="total-row">

                <span>
                  TOTAL
                </span>

                <span>
                  ₹${order.total.toFixed(2)}
                </span>

              </div>

            </div>

            <div class="payment">

              <strong>
                Payment:
              </strong>

              ${paymentMethod}

              &nbsp; • &nbsp;

              <strong>
                PAID
              </strong>

            </div>

            <div class="footer">

              <strong>
                Thank you for dining with
                REDDY'S KITCHEN!
              </strong>

              <br />

              Please visit us again.

            </div>

          </div>

        </body>

      </html>
    `);

    printWindow.document.close();

    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 300);
  }

  // =========================================
  // ESCAPE HTML
  // =========================================

  function escapeHtml(
    value: string
  ) {
    return value
      .replace(/&/g, "&amp;")
      .replace(
        /</g,
        "&lt;"
      )
      .replace(
        />/g,
        "&gt;"
      )
      .replace(
        /"/g,
        "&quot;"
      )
      .replace(
        /'/g,
        "&#039;"
      );
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
    <AdminLayout title="Billing & Payments">

      {/* HEADER */}

      <div className="mb-8">

        <h1 className="text-3xl font-bold">
          Billing & Payments
        </h1>

        <p className="text-gray-400 mt-2">
          Collect payments after the
          order has been served.
        </p>

      </div>

      {/* =================================== */}
      {/* SUMMARY */}
      {/* =================================== */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">

          <p className="text-gray-400">
            Awaiting Payment
          </p>

          <p className="text-3xl font-bold text-red-400 mt-2">
            {unpaidOrders.length}
          </p>

        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">

          <p className="text-gray-400">
            Paid / Active
          </p>

          <p className="text-3xl font-bold text-green-400 mt-2">
            {paidOrders.length}
          </p>

        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">

          <p className="text-gray-400">
            Payment Pending Value
          </p>

          <p className="text-3xl font-bold text-yellow-400 mt-2">
            ₹
            {unpaidOrders.reduce(
              (sum, order) =>
                sum + order.total,
              0
            )}
          </p>

        </div>

      </div>

      {/* =================================== */}
      {/* PAYMENT PENDING */}
      {/* =================================== */}

      <div className="mb-10">

        <h2 className="text-2xl font-bold mb-5">
          Payment Pending
        </h2>

        {unpaidOrders.length ===
        0 ? (

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-10 text-center">

            <CheckCircle
              size={45}
              className="mx-auto text-green-400 mb-3"
            />

            <p className="text-gray-400">
              No pending payments.
            </p>

          </div>

        ) : (

          <div className="space-y-6">

            {unpaidOrders.map(
              (order) => {

                const processing =
                  processingOrder ===
                  order.id;

                const served =
                  order.status ===
                  "Completed";

                return (

                  <div
                    key={order.id}
                    className={`bg-zinc-900 border rounded-2xl p-6 ${
                      served
                        ? "border-purple-700"
                        : "border-zinc-800"
                    }`}
                  >

                    {/* HEADER */}

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

                      <div>

                        <div className="flex items-center gap-3">

                          <h2 className="text-2xl font-bold">
                            Table #{order.table}
                          </h2>

                          {served && (

                            <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                              SERVED
                            </span>

                          )}

                        </div>

                        <p className="text-gray-400 mt-1">
                          {order.customerName}
                        </p>

                        {order.phone && (

                          <p className="text-sm text-gray-500 mt-1">
                            📞 {order.phone}
                          </p>

                        )}

                      </div>

                      <div className="text-left md:text-right">

                        <p className="text-gray-400">
                          Amount Due
                        </p>

                        <p className="text-3xl font-bold text-yellow-400">
                          ₹{order.total}
                        </p>

                        <span className="inline-flex items-center gap-2 mt-2 bg-red-600/20 text-red-400 px-3 py-1 rounded-full text-sm font-semibold">

                          <Clock size={16} />

                          Payment Pending

                        </span>

                      </div>

                    </div>

                    {/* SERVED MESSAGE */}

                    {served && (

                      <div className="mt-6 bg-purple-950/40 border border-purple-700 rounded-xl p-5">

                        <h3 className="text-purple-300 font-bold text-lg">
                          💳 Payment Required
                        </h3>

                        <p className="text-gray-300 mt-2">
                          The order has been
                          served. Please collect
                          payment from the
                          customer.
                        </p>

                        <p className="text-gray-400 text-sm mt-2">
                          Accepted methods:
                          <span className="text-white font-semibold">
                            {" "}Cash
                          </span>
                          {" "}or{" "}
                          <span className="text-white font-semibold">
                            UPI
                          </span>
                        </p>

                      </div>

                    )}

                    {/* ITEMS */}

                    <div className="mt-6 bg-zinc-800 rounded-xl p-5">

                      <h3 className="font-bold mb-4">
                        Bill Items
                      </h3>

                      <div className="space-y-3">

                        {order.items.map(
                          (item) => (

                            <div
                              key={item.id}
                              className="flex justify-between text-gray-300"
                            >

                              <span>
                                {item.name} ×{" "}
                                {item.quantity}
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

                      <div className="border-t border-zinc-700 mt-5 pt-5 flex justify-between">

                        <span className="text-xl font-bold">
                          Total
                        </span>

                        <span className="text-xl font-bold text-yellow-400">
                          ₹{order.total}
                        </span>

                      </div>

                    </div>

                    {/* PAYMENT BUTTONS */}

                    <div className="mt-6">

                      <p className="font-semibold mb-3">
                        Record Payment
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                        <button
                          disabled={
                            processing
                          }
                          onClick={() =>
                            markPaid(
                              order.id,
                              "Cash"
                            )
                          }
                          className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-zinc-700 py-4 rounded-xl font-bold transition"
                        >

                          <Banknote
                            size={20}
                          />

                          Cash

                        </button>

                        <button
                          disabled={
                            processing
                          }
                          onClick={() =>
                            markPaid(
                              order.id,
                              "UPI"
                            )
                          }
                          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 py-4 rounded-xl font-bold transition"
                        >

                          <Smartphone
                            size={20}
                          />

                          UPI

                        </button>

                      </div>

                    </div>

                  </div>

                );
              }
            )}

          </div>

        )}

      </div>

      {/* =================================== */}
      {/* PAID / ACTIVE */}
      {/* =================================== */}

      {paidOrders.length > 0 && (

        <div>

          <h2 className="text-2xl font-bold mb-5">
            Paid Orders
          </h2>

          <div className="space-y-6">

            {paidOrders.map(
              (order) => {

                const processing =
                  processingOrder ===
                  order.id;

                return (

                  <div
                    key={order.id}
                    className="bg-zinc-900 border border-green-800 rounded-2xl p-6"
                  >

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

                      <div>

                        <div className="flex items-center gap-3">

                          <h2 className="text-2xl font-bold">
                            Table #{order.table}
                          </h2>

                          <span className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                            PAID
                          </span>

                        </div>

                        <p className="text-gray-400 mt-1">
                          {order.customerName}
                        </p>

                      </div>

                      <div className="text-left md:text-right">

                        <p className="text-3xl font-bold text-green-400">
                          ₹{order.total}
                        </p>

                        <p className="text-sm text-gray-500 mt-1">
                          {order.paymentMethod}
                        </p>

                      </div>

                    </div>

                    {/* ACTIONS */}

                    <div className="mt-6 flex flex-col sm:flex-row gap-3">

                      <button
                        onClick={() =>
                          printBill(
                            order
                          )
                        }
                        className="flex-1 flex items-center justify-center gap-2 bg-white text-black hover:bg-gray-200 py-4 rounded-xl font-bold transition"
                      >

                        <Printer
                          size={20}
                        />

                        Print Bill

                      </button>

                      <button
                        disabled={
                          processing
                        }
                        onClick={() =>
                          markUnpaid(
                            order.id
                          )
                        }
                        className="flex-1 bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-700 py-4 rounded-xl font-semibold transition"
                      >
                        Mark Unpaid
                      </button>

                    </div>

                  </div>

                );
              }
            )}

          </div>

        </div>

      )}

    </AdminLayout>
  );
}

export default BillingManagement;