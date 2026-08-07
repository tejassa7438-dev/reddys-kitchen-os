import Logo from "./components/layout/Logo";
import RestaurantHeader from "./components/layout/RestaurantHeader";
import HeroSection from "./components/layout/HeroSection";

function App() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6">

      <div className="pt-10">
        <Logo />
      </div>

      <RestaurantHeader
        name="REDDY'S KITCHEN"
        tagline="🌱 Pure Veg Restaurant"
      />

      <HeroSection />

    </div>
  );
}

export default App;