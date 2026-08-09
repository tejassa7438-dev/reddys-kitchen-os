import { useEffect, useMemo, useState } from "react";
import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import FoodCard from "../../components/menu/FoodCard";
import SearchBar from "../../components/menu/SearchBar";
import CategoryTabs from "../../components/menu/CategoryTabs";
import CartSummary from "../../components/cart/CartSummary";

import { menuService } from "../../services/menuService";
import type { MenuItem } from "../../types/menu";

import { useTableStore } from "../../store/tableStore";

function MenuPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // -----------------------------------------
  // Table Management
  // -----------------------------------------

  const table = useTableStore(
    (state) => state.table
  );

  const setTable = useTableStore(
    (state) => state.setTable
  );

  // -----------------------------------------
  // Menu State
  // -----------------------------------------

  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState("All");

  // -----------------------------------------
  // Read Table Number From URL
  // -----------------------------------------

  useEffect(() => {
    const tableParam = searchParams.get("table");

    if (!tableParam) {
      return;
    }

    const parsedTable = Number(tableParam);

    if (
      Number.isInteger(parsedTable) &&
      parsedTable > 0
    ) {
      setTable(parsedTable);
    }
  }, [searchParams, setTable]);

  // -----------------------------------------
  // Subscribe To Menu
  // -----------------------------------------

  useEffect(() => {
    const unsubscribe = menuService.subscribe(
      (data) => {
        setItems(data);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  // -----------------------------------------
  // Filter Menu
  // -----------------------------------------

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
  }, [
    items,
    search,
    selectedCategory,
  ]);

  // -----------------------------------------
  // Loading Screen
  // -----------------------------------------

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">

          <h1 className="text-3xl font-bold text-red-600">
            Loading Menu...
          </h1>

          <p className="text-gray-400 mt-3">
            Please wait...
          </p>

        </div>
      </div>
    );
  }

  // -----------------------------------------
  // Menu Page
  // -----------------------------------------

  return (
    <div className="min-h-screen bg-black text-white">

      {/* ----------------------------------- */}
      {/* Header */}
      {/* ----------------------------------- */}

      <div className="sticky top-0 z-20 bg-black border-b border-zinc-800">

        <div className="max-w-6xl mx-auto px-5 py-6">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

            {/* Restaurant Name */}

            <div>

              <h1 className="text-4xl font-extrabold text-red-600">
                🍽 REDDY'S KITCHEN
              </h1>

              <p className="text-gray-400 mt-2">
                Fresh • Hygienic • Delicious
              </p>

              <p className="text-sm text-gray-500 mt-1">
                Table {table}
              </p>

            </div>

            {/* ----------------------------------- */}
            {/* Current Order Button */}
            {/* ----------------------------------- */}

            {localStorage.getItem(
              `activeOrderId_table_${table}`
            ) && (

              <button
                onClick={() => {

                  const orderId =
                    localStorage.getItem(
                      `activeOrderId_table_${table}`
                    );

                  if (orderId) {
                    navigate(
                      `/track/${orderId}`
                    );
                  }

                }}
                className="bg-green-600 hover:bg-green-700 px-5 py-3 rounded-xl font-bold transition whitespace-nowrap"
              >
                🛒 View Current Order
              </button>

            )}

          </div>

        </div>

      </div>

      {/* ----------------------------------- */}
      {/* Main Content */}
      {/* ----------------------------------- */}

      <div className="max-w-6xl mx-auto px-5 py-6">



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

        {/* ----------------------------------- */}
        {/* Menu Items */}
        {/* ----------------------------------- */}

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

      {/* ----------------------------------- */}
      {/* Floating Cart */}
      {/* ----------------------------------- */}

      <CartSummary />

    </div>
  );
}

export default MenuPage;