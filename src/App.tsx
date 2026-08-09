import { BrowserRouter, Routes, Route } from "react-router-dom";

import WelcomePage from "./pages/Home/WelcomePage";
import MenuPage from "./pages/Menu/MenuPage";
import CartPage from "./pages/Cart/CartPage";
import CheckoutPage from "./pages/checkout/CheckoutPage";
import KitchenPage from "./pages/Kitchen/KitchenPage";
import TrackOrderPage from "./pages/TrackOrder/TrackOrderPage";

import AdminDashboard from "./pages/Admin/AdminDashboard";
import MenuManagement from "./pages/Admin/MenuManagement";
import OrdersManagement from "./pages/Admin/OrdersManagement";
import Settings from "./pages/Admin/Settings";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Customer */}

        <Route
          path="/"
          element={<WelcomePage />}
        />

        <Route
          path="/menu"
          element={<MenuPage />}
        />

        <Route
          path="/cart"
          element={<CartPage />}
        />

        <Route
          path="/checkout"
          element={<CheckoutPage />}
        />

        <Route
          path="/track/:orderId"
          element={<TrackOrderPage />}
        />

        {/* Kitchen */}

        <Route
          path="/kitchen"
          element={<KitchenPage />}
        />

        {/* Admin */}

        <Route
          path="/admin"
          element={<AdminDashboard />}
        />

        <Route
          path="/admin/menu"
          element={<MenuManagement />}
        />

        <Route
          path="/admin/orders"
          element={<OrdersManagement />}
        />

        <Route
          path="/admin/settings"
          element={<Settings />}
        />
        <Route
  path="*"
  element={
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-red-600">404</h1>
        <p className="mt-4 text-gray-400">
          Page Not Found
        </p>
      </div>
    </div>
  }
/>

      </Routes>
    </BrowserRouter>
  );
}

export default App;