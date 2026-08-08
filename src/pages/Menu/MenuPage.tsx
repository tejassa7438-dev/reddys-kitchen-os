import { useState } from "react";
import FoodCard from "../../components/menu/FoodCard";
import SearchBar from "../../components/menu/SearchBar";
import CategoryTabs from "../../components/menu/CategoryTabs";
import CartSummary from "../../components/cart/CartSummary";
import { menuItems } from "../../constants/menu";

function MenuPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const filteredItems = menuItems.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      category === "All" || item.category === category;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-black text-white p-6">

      <h1 className="text-4xl font-bold text-red-600">
        🍽 MENU
      </h1>

      <p className="text-gray-400 mt-2">
        Choose your favourite dishes
      </p>

      <div className="mt-6">
        <SearchBar
          value={search}
          onChange={setSearch}
        />
      </div>

      <div className="mt-6">
        <CategoryTabs
          selected={category}
          onSelect={setCategory}
        />
      </div>

      <div className="mt-8 space-y-4">
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

      <CartSummary />
    </div>
  );
}

export default MenuPage;