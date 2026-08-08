import { useCartStore } from "../../store/cartStore";

type FoodCardProps = {
  id: number;
  name: string;
  description: string;
  price: number;
};

function FoodCard({
  id,
  name,
  description,
  price,
}: FoodCardProps) {
  const { items, addItem, decreaseItem } = useCartStore();

  const cartItem = items.find((item) => item.id === id);

  const quantity = cartItem?.quantity ?? 0;

  return (
    <div className="bg-zinc-900 rounded-3xl overflow-hidden shadow-xl hover:shadow-red-500/20 hover:-translate-y-1 transition-all duration-300">

      {/* Image Placeholder */}
      <div className="h-44 bg-gradient-to-br from-red-700 via-red-600 to-orange-500 flex items-center justify-center">

        <span className="text-6xl">
          🍽️
        </span>

      </div>

      {/* Content */}
      <div className="p-5">

        <div className="flex justify-between items-center">

          <span className="text-green-400 font-semibold">
            🟢 Pure Veg
          </span>

          <span className="bg-yellow-500 text-black px-3 py-1 rounded-full text-xs font-bold">
            ⭐ Popular
          </span>

        </div>

        <h2 className="text-2xl font-bold text-white mt-4">
          {name}
        </h2>

        <p className="text-gray-400 mt-2 min-h-[48px]">
          {description}
        </p>

        <div className="flex justify-between items-center mt-6">

          <p className="text-3xl font-bold text-yellow-400">
            ₹{price}
          </p>

          {quantity === 0 ? (
            <button
              onClick={() =>
                addItem({
                  id,
                  name,
                  price,
                })
              }
              className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-xl font-bold transition"
            >
              Add
            </button>
          ) : (
            <div className="flex items-center gap-3">

              <button
                onClick={() => decreaseItem(id)}
                className="bg-red-600 hover:bg-red-700 w-10 h-10 rounded-full text-xl"
              >
                −
              </button>

              <span className="text-xl font-bold w-8 text-center">
                {quantity}
              </span>

              <button
                onClick={() =>
                  addItem({
                    id,
                    name,
                    price,
                  })
                }
                className="bg-green-600 hover:bg-green-700 w-10 h-10 rounded-full text-xl"
              >
                +
              </button>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}

export default FoodCard;