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
    <div className="bg-zinc-900 rounded-xl p-5 flex justify-between items-center hover:bg-zinc-800 transition">
      <div>
        <h2 className="text-xl font-bold text-white">
          {name}
        </h2>

        <p className="text-gray-400 mt-1">
          {description}
        </p>

        <p className="text-yellow-400 font-semibold mt-2">
          ₹{price}
        </p>
      </div>

      <button className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-xl text-white font-semibold">
        Add
      </button>
    </div>
  );
}

export default FoodCard;