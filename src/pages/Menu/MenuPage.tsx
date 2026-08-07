import FoodCard from "../../components/menu/FoodCard";
import { menuItems } from "../../constants/menu";

function MenuPage() {
  return (
    <div className="min-h-screen bg-black text-white p-8">
      {/* Page Title */}
      <h1 className="text-4xl font-bold text-red-600">
        🍽 MENU
      </h1>

      <p className="text-gray-400 mt-2 mb-8">
        Choose your favourite dishes
      </p>

      {/* Food Cards */}
      <div className="space-y-4">
        {menuItems.map((item) => (
          <FoodCard
            key={item.id}
            id={item.id}
            name={item.name}
            description={item.description}
            price={item.price}
          />
        ))}
      </div>
    </div>
  );
}

export default MenuPage;