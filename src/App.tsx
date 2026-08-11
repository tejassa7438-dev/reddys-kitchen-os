import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

// =========================================
// CUSTOMER
// =========================================

import WelcomePage from "./pages/Home/WelcomePage";
import MenuPage from "./pages/Menu/MenuPage";
import CartPage from "./pages/Cart/CartPage";
import CheckoutPage from "./pages/checkout/CheckoutPage";
import OrderSuccessPage from "./pages/OrderSuccess/OrderSuccessPage";
import TrackOrderPage from "./pages/TrackOrder/TrackOrderPage";

// =========================================
// STAFF AUTH
// =========================================

import StaffLoginPage from "./pages/Auth/StaffLoginPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// =========================================
// KITCHEN
// =========================================

import KitchenPage from "./pages/Kitchen/KitchenPage";

// =========================================
// ADMIN
// =========================================

import AdminDashboard from "./pages/Admin/AdminDashboard";
import MenuManagement from "./pages/Admin/MenuManagement";
import OrdersManagement from "./pages/Admin/OrdersManagement";
import TableManagement from "./pages/Admin/TableManagement";
import BillingManagement from "./pages/Admin/BillingManagement";
import SalesReports from "./pages/Admin/SalesReports";
import Settings from "./pages/Admin/Settings";

function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* ================================= */}
        {/* CUSTOMER */}
        {/* ================================= */}

        <Route
          path="/"
          element={
            <WelcomePage />
          }
        />

        <Route
          path="/menu"
          element={
            <MenuPage />
          }
        />

        <Route
          path="/cart"
          element={
            <CartPage />
          }
        />

        <Route
          path="/checkout"
          element={
            <CheckoutPage />
          }
        />

        <Route
          path="/success"
          element={
            <OrderSuccessPage />
          }
        />

        <Route
          path="/track/:orderId"
          element={
            <TrackOrderPage />
          }
        />

        {/* ================================= */}
        {/* STAFF LOGIN */}
        {/* ================================= */}

        <Route
          path="/staff-login"
          element={
            <StaffLoginPage />
          }
        />

        {/* ================================= */}
        {/* KITCHEN */}
        {/* ================================= */}

        <Route
          path="/kitchen"
          element={
            <ProtectedRoute>
              <KitchenPage />
            </ProtectedRoute>
          }
        />

        {/* ================================= */}
        {/* ADMIN DASHBOARD */}
        {/* ================================= */}

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* ================================= */}
        {/* MENU MANAGEMENT */}
        {/* ================================= */}

        <Route
          path="/admin/menu"
          element={
            <ProtectedRoute>
              <MenuManagement />
            </ProtectedRoute>
          }
        />

        {/* ================================= */}
        {/* ORDERS */}
        {/* ================================= */}

        <Route
          path="/admin/orders"
          element={
            <ProtectedRoute>
              <OrdersManagement />
            </ProtectedRoute>
          }
        />

        {/* ================================= */}
        {/* TABLE MANAGEMENT */}
        {/* ================================= */}

        <Route
          path="/admin/tables"
          element={
            <ProtectedRoute>
              <TableManagement />
            </ProtectedRoute>
          }
        />

        {/* ================================= */}
        {/* BILLING */}
        {/* ================================= */}

        <Route
          path="/admin/billing"
          element={
            <ProtectedRoute>
              <BillingManagement />
            </ProtectedRoute>
          }
        />

        {/* ================================= */}
        {/* SALES REPORTS */}
        {/* ================================= */}

        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute>
              <SalesReports />
            </ProtectedRoute>
          }
        />

        {/* ================================= */}
        {/* SETTINGS */}
        {/* ================================= */}

        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />

        {/* ================================= */}
        {/* 404 */}
        {/* ================================= */}

        <Route
          path="*"
          element={
            <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">

              <div className="text-center">

                <h1 className="text-7xl font-bold text-red-500">
                  404
                </h1>

                <p className="text-2xl mt-4">
                  Page Not Found
                </p>

                <a
                  href="/"
                  className="inline-block mt-6 bg-red-600 hover:bg-red-700 px-6 py-3 rounded-xl font-semibold transition"
                >
                  Back Home
                </a>

              </div>

            </div>
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;