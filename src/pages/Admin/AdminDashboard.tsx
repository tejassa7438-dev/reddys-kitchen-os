import { useEffect, useMemo, useState } from "react";
import {
  UtensilsCrossed,
  ClipboardList,
  Clock3,
  ChefHat,
  CheckCircle,
  IndianRupee,
} from "lucide-react";

import AdminLayout from "../../components/admin/AdminLayout";
import Loading from "../../components/ui/Loading";
import StatCard from "../../components/ui/StatCard";

import { menuService } from "../../services/menuService";
import { orderService } from "../../services/orderService";

import type { MenuItem } from "../../types/menu";
import type { Order } from "../../types/order";

function AdminDashboard() {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubMenu = menuService.subscribe((items) => {
      setMenu(items);
    });

    const unsubOrders =
      orderService.subscribeToOrders((items) => {
        setOrders(items);
        setLoading(false);
      });

    return () => {
      unsubMenu();
      unsubOrders();
    };
  }, []);

  const stats = useMemo(() => {
    const today = new Date().toDateString();

    const todayOrders = orders.filter(
      (o) =>
        new Date(o.createdAt).toDateString() ===
        today
    );

    const pending = orders.filter(
      (o) => o.status === "Pending"
    ).length;

    const preparing = orders.filter(
      (o) => o.status === "Preparing"
    ).length;

    const ready = orders.filter(
      (o) => o.status === "Ready"
    ).length;

    const revenue = todayOrders.reduce(
      (sum, order) => sum + order.total,
      0
    );

    return {
      menu: menu.length,
      totalOrders: orders.length,
      pending,
      preparing,
      ready,
      revenue,
      recent: orders.slice(0, 5),
    };
  }, [menu, orders]);

  if (loading) {
    return (
      <AdminLayout title="Dashboard">
        <Loading />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Dashboard">

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

        <StatCard
          title="Menu Items"
          value={stats.menu}
          color="bg-red-600"
          icon={<UtensilsCrossed />}
        />

        <StatCard
          title="Orders"
          value={stats.totalOrders}
          color="bg-blue-600"
          icon={<ClipboardList />}
        />

        <StatCard
          title="Revenue"
          value={stats.revenue}
          color="bg-green-600"
          icon={<IndianRupee />}
        />

        <StatCard
          title="Pending"
          value={stats.pending}
          color="bg-yellow-600"
          icon={<Clock3 />}
        />

        <StatCard
          title="Preparing"
          value={stats.preparing}
          color="bg-orange-600"
          icon={<ChefHat />}
        />

        <StatCard
          title="Ready"
          value={stats.ready}
          color="bg-emerald-600"
          icon={<CheckCircle />}
        />      </div>

      {/* Quick Actions */}
      <div className="mt-10">

        <h2 className="text-2xl font-bold mb-5">
          Quick Actions
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">

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
              View all customer orders
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
              Open live kitchen dashboard
            </p>
          </a>

          <a
            href="/admin/settings"
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:bg-zinc-800 transition"
          >
            <h3 className="text-xl font-bold">
              ⚙ Settings
            </h3>

            <p className="text-gray-400 mt-2">
              Restaurant configuration
            </p>
          </a>

        </div>

      </div>

      {/* Recent Orders */}

      <div className="mt-12">

        <h2 className="text-2xl font-bold mb-5">
          Recent Orders
        </h2>

        <div className="overflow-hidden rounded-2xl border border-zinc-800">

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
                  Status
                </th>

              </tr>

            </thead>

            <tbody>

              {stats.recent.map((order) => (

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
                      className={`px-3 py-1 rounded-full text-sm font-semibold
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

                  </td>

                </tr>

              ))}

              {stats.recent.length === 0 && (

                <tr>

                  <td
                    colSpan={4}
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

    </AdminLayout>
  );
}

export default AdminDashboard;