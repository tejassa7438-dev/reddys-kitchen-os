import { useState } from "react";

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
  const [quantity, setQuantity] = useState(0);

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

      {quantity === 0 ? (
        <button
          onClick={() => setQuantity(1)}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-xl transition"
        >
          Add
        </button>
      ) : (
        <div className="flex items-center gap-4">

          <button
            onClick={() => setQuantity(quantity - 1)}
            className="bg-red-600 w-10 h-10 rounded-full text-xl"
          >
            −
          </button>

          <span className="text-xl font-bold">
            {quantity}
          </span>

          <button
            onClick={() => setQuantity(quantity + 1)}
            className="bg-green-600 w-10 h-10 rounded-full text-xl"
          >
            +
          </button>

        </div>
      )}
    </div>
  );
}

export default FoodCard;