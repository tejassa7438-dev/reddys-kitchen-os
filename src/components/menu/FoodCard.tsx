type FoodCardProps = {
  id: number;
  name: string;
  description: string;
  price: number;
};

function FoodCard({
  name,
  description,
  price,
}: FoodCardProps) {
  return (
    <div className="bg-zinc-900 rounded-2xl p-5 shadow-lg hover:bg-zinc-800 transition duration-300 flex justify-between items-center">

      <div className="flex-1">
        <h2 className="text-2xl font-bold text-white">
          {name}
        </h2>

        <p className="text-gray-400 mt-2">
          {description}
        </p>

        <p className="text-yellow-400 text-xl font-bold mt-3">
          ₹{price}
        </p>
      </div>

      <button className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-xl transition">
        Add
      </button>

    </div>
  );
}

export default FoodCard;