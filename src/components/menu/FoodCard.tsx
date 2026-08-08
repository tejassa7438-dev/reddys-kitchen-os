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
          onClick={() =>
            addItem({
              id,
              name,
              price,
            })
          }
          className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-xl transition"
        >
          Add
        </button>
      ) : (
        <div className="flex items-center gap-4">
          <button
            onClick={() => decreaseItem(id)}
            className="bg-red-600 hover:bg-red-700 text-white w-10 h-10 rounded-full text-xl font-bold"
          >
            −
          </button>

          <span className="text-xl font-bold text-white">
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
            className="bg-green-600 hover:bg-green-700 text-white w-10 h-10 rounded-full text-xl font-bold"
          >
            +
          </button>
        </div>
      )}
    </div>
  );
}

export default FoodCard;