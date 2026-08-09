import { useEffect, useState } from "react";

import { categoryService } from "../../services/categoryService";

type Props = {
  selected: string;
  onSelect: (category: string) => void;
};

const defaultCategories = [
  "Soup",
  "Burger",
  "Momos",
  "Sandwich",
  "Pizza",
  "Pasta",
  "Starters",
  "South Indian",
  "Biryani",
  "Rice & Noodles",
  "Main Course",
  "Drinks",
];

function CategoryTabs({
  selected,
  onSelect,
}: Props) {

  const [categories, setCategories] =
    useState<string[]>(
      defaultCategories
    );

  useEffect(() => {

    const unsubscribe =
      categoryService.subscribe(
        (data) => {

          if (data.length > 0) {
            setCategories(data);
          }

        }
      );

    return unsubscribe;

  }, []);

  const allCategories = [
    "All",
    ...categories,
  ];

  return (
    <div className="flex gap-3 overflow-x-auto pb-2">

      {allCategories.map(
        (cat) => (

          <button
            key={cat}
            onClick={() =>
              onSelect(cat)
            }
            className={`px-5 py-2 rounded-full whitespace-nowrap transition ${
              selected === cat
                ? "bg-red-600 text-white"
                : "bg-zinc-800 text-gray-300 hover:bg-zinc-700"
            }`}
          >
            {cat}
          </button>

        )
      )}

    </div>
  );
}

export default CategoryTabs;