import { useState } from "react";
import FoodCard from "../../components/menu/FoodCard";
import { menuItems } from "../../constants/menu";

function MenuPage() {
  const categories = [
    "All",
    ...new Set(menuItems.map((item) => item.category)),
  ];

  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredItems =
    selectedCategory === "All"
      ? menuItems
      : menuItems.filter(
          (item) => item.category === selectedCategory
        );

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-4xl font-bold text-red-600">
        🍽 MENU
      </h1>

      <p className="text-gray-400 mt-2 mb-8">
        Choose your favourite dishes
      </p>

      {/* Category Buttons */}
      <div className="flex gap-3 overflow-x-auto mb-8">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-5 py-2 rounded-full transition font-semibold ${
              selectedCategory === category
                ? "bg-red-600 text-white"
                : "bg-zinc-800 hover:bg-zinc-700"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Food List */}
      <div className="grid gap-5">
        {filteredItems.map((item) => (
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