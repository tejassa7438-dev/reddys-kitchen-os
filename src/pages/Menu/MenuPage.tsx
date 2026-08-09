import { useEffect, useMemo, useState } from "react";

import FoodCard from "../../components/menu/FoodCard";
import SearchBar from "../../components/menu/SearchBar";
import CategoryTabs from "../../components/menu/CategoryTabs";
import PopularBanner from "../../components/menu/PopularBanner";
import CartSummary from "../../components/cart/CartSummary";

import { menuService } from "../../services/menuService";
import type { MenuItem } from "../../types/menu";

function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    const unsubscribe = menuService.subscribe((data) => {
      setItems(data);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = item.name
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesCategory =
        selectedCategory === "All" ||
        item.category === selectedCategory;

      return (
        matchesSearch &&
        matchesCategory &&
        item.available
      );
    });
  }, [items, search, selectedCategory]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-red-500">
            Loading Menu...
          </h2>

          <p className="text-gray-400 mt-3">
            Please wait...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">

      {/* Header */}
      <div className="sticky top-0 z-20 bg-black border-b border-zinc-800">

        <div className="max-w-6xl mx-auto px-5 py-6">

          <h1 className="text-4xl font-extrabold text-red-600">
            🍽 REDDY'S KITCHEN
          </h1>

          <p className="text-gray-400 mt-2">
            Fresh • Hygienic • Delicious
          </p>

        </div>

      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-5 py-6">

        {/* Today's Special */}
        <PopularBanner />

        {/* Search */}
        <div className="mt-8">
          <SearchBar
            value={search}
            onChange={setSearch}
          />
        </div>

        {/* Categories */}
        <div className="mt-6">
          <CategoryTabs
            selected={selectedCategory}
            onSelect={setSelectedCategory}
          />
        </div>

        {/* Menu */}
        <div className="mt-8 grid gap-5 pb-32">

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
            <div className="text-center py-16">

              <h2 className="text-2xl font-bold text-gray-400">
                😔 No dishes found
              </h2>

              <p className="mt-3 text-gray-500">
                Try another search or category.
              </p>

            </div>
          )}

        </div>

      </div>

      {/* Floating Cart */}
      <CartSummary />

    </div>
  );
}

export default MenuPage;