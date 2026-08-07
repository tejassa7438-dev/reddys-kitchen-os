import { useState } from "react";
import FoodCard from "../../components/menu/FoodCard";
import { menuItems } from "../../constants/menu";

function MenuPage() {
  // Get unique categories
  const categories = [
    "All",
    ...new Set(menuItems.map((item) => item.category)),
  ];

  // States
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");

  // Filter menu
  const filteredItems = menuItems.filter((item) => {
    const matchesCategory =
      selectedCategory === "All" ||
      item.category === selectedCategory;

    const matchesSearch = item.name
      .toLowerCase()
      .includes(search.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-black text-white p-6">

      {/* Title */}
      <h1 className="text-4xl font-bold text-red-600">
        🍽 MENU
      </h1>

      <p className="text-gray-400 mt-2 mb-6">
        Choose your favourite dishes
      </p>

      {/* Search */}
      <input
        type="text"
        placeholder="🔍 Search dishes..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-6 px-5 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-white placeholder-gray-500 focus:outline-none focus:border-red-600"
      />

      {/* Categories */}
      <div className="flex gap-3 overflow-x-auto mb-8 pb-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-5 py-2 rounded-full whitespace-nowrap transition font-semibold ${
              selectedCategory === category
                ? "bg-red-600 text-white"
                : "bg-zinc-800 hover:bg-zinc-700"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Menu Items */}
      <div className="grid gap-5">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <FoodCard
              key={item.id}
              id={item.id}
              name={item.name}
              description={item.description}
              price={item.price}
            />
          ))
        ) : (
          <div className="text-center py-20">
            <h2 className="text-2xl text-gray-400">
              😔 No dishes found
            </h2>

            <p className="mt-3 text-gray-500">
              Try another search or category.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}

export default MenuPage;