import { BrowserRouter, Routes, Route } from "react-router-dom";

import WelcomePage from "./pages/Home/WelcomePage";
import MenuPage from "./pages/Menu/MenuPage";
import CartPage from "./pages/Cart/CartPage";
import CheckoutPage from "./pages/checkout/CheckoutPage";
import OrderSuccessPage from "./pages/OrderSuccess/OrderSuccessPage";
import KitchenPage from "./pages/Kitchen/KitchenPage";
import TrackOrderPage from "./pages/TrackOrder/TrackOrderPage";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Customer App */}
        <Route path="/" element={<WelcomePage />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/success" element={<OrderSuccessPage />} />
        <Route path="/track/:orderId" element={<TrackOrderPage />} />

        {/* Kitchen Dashboard */}
        <Route path="/kitchen" element={<KitchenPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;