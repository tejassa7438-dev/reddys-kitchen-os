type Props = {
  selected: string;
  onSelect: (category: string) => void;
};

const categories = [
  "All",
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

function CategoryTabs({ selected, onSelect }: Props) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onSelect(cat)}
          className={`px-5 py-2 rounded-full whitespace-nowrap transition ${
            selected === cat
              ? "bg-red-600 text-white"
              : "bg-zinc-800 text-gray-300 hover:bg-zinc-700"
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}

export default CategoryTabs;