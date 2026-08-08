import { BrowserRouter, Routes, Route } from "react-router-dom";

import WelcomePage from "./pages/Home/WelcomePage";
import MenuPage from "./pages/Menu/MenuPage";
import CartPage from "./pages/Cart/CartPage";
import CheckoutPage from "./pages/checkout/CheckoutPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Welcome */}
        <Route path="/" element={<WelcomePage />} />

        {/* Menu */}
        <Route path="/menu" element={<MenuPage />} />

        {/* Cart */}
        <Route path="/cart" element={<CartPage />} />

        {/* Checkout */}
        <Route path="/checkout" element={<CheckoutPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;