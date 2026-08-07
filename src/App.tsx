import { BrowserRouter, Routes, Route } from "react-router-dom";

import WelcomePage from "./pages/Home/WelcomePage";
import MenuPage from "./pages/Menu/MenuPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/menu" element={<MenuPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;