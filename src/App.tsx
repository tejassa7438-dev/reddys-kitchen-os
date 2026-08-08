import { BrowserRouter, Routes, Route } from "react-router-dom";

import WelcomePage from "./pages/Home/WelcomePage";
import MenuPage from "./pages/Menu/MenuPage";
import CartPage from "./pages/Cart/CartPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/cart" element={<CartPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;