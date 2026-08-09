import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  UtensilsCrossed,
  ClipboardList,
  ChefHat,
  Settings,
} from "lucide-react";

interface Props {
  title: string;
  children: React.ReactNode;
}

const navItems = [
  {
    name: "Dashboard",
    path: "/admin",
    icon: LayoutDashboard,
  },
  {
    name: "Menu",
    path: "/admin/menu",
    icon: UtensilsCrossed,
  },
  {
    name: "Orders",
    path: "/admin/orders",
    icon: ClipboardList,
  },
  {
    name: "Kitchen",
    path: "/kitchen",
    icon: ChefHat,
  },
  {
    name: "Settings",
    path: "/admin/settings",
    icon: Settings,
  },
];

function AdminLayout({
  title,
  children,
}: Props) {
  return (
    <div className="min-h-screen bg-black text-white flex">

      {/* Sidebar */}

      <aside className="w-72 bg-zinc-900 border-r border-zinc-800 p-6 flex flex-col">

        <h1 className="text-3xl font-bold text-red-500 mb-10">
          🍽 REDDY'S KITCHEN
        </h1>

        <nav className="space-y-3">

          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 p-4 rounded-xl transition ${
                    isActive
                      ? "bg-red-600"
                      : "hover:bg-zinc-800"
                  }`
                }
              >
                <Icon size={22} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}

        </nav>

      </aside>

      {/* Main */}

      <main className="flex-1 flex flex-col">

        <header className="border-b border-zinc-800 bg-zinc-950 px-8 py-6">

          <h2 className="text-3xl font-bold">
            {title}
          </h2>

        </header>

        <div className="flex-1 p-8 overflow-auto">

          {children}

        </div>

      </main>

    </div>
  );
}

export default AdminLayout;