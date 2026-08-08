import { useNavigate } from "react-router-dom";
import { useCartStore } from "../../store/cartStore";

function CartPage() {
  const navigate = useNavigate();

  const { items, addItem, decreaseItem } = useCartStore();

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="min-h-screen bg-black text-white p-6">

      <button
        onClick={() => navigate("/menu")}
        className="mb-6 text-red-500 hover:text-red-400"
      >
        ← Back to Menu
      </button>

      <h1 className="text-4xl font-bold text-red-600">
        🛒 Your Cart
      </h1>

      {items.length === 0 ? (
        <p className="mt-10 text-gray-400 text-xl">
          Your cart is empty.
        </p>
      ) : (
        <>
          <div className="mt-8 space-y-5">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-zinc-900 rounded-2xl p-5 flex justify-between items-center"
              >
                <div>
                  <h2 className="text-xl font-bold">
                    {item.name}
                  </h2>

                  <p className="text-yellow-400 mt-2">
                    ₹{item.price}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    onClick={() => decreaseItem(item.id)}
                    className="bg-red-600 w-10 h-10 rounded-full"
                  >
                    −
                  </button>

                  <span className="text-xl font-bold">
                    {item.quantity}
                  </span>

                  <button
                    onClick={() =>
                      addItem({
                        id: item.id,
                        name: item.name,
                        price: item.price,
                      })
                    }
                    className="bg-green-600 w-10 h-10 rounded-full"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 border-t border-zinc-700 pt-6">
            <div className="flex justify-between text-2xl font-bold">
              <span>Total</span>

              <span className="text-yellow-400">
                ₹{total}
              </span>
            </div>

            <button
  onClick={() => navigate("/checkout")}
  className="w-full mt-8 bg-green-600 hover:bg-green-700 py-4 rounded-xl text-xl font-bold"
>
  Proceed to Checkout
</button>
          </div>
        </>
      )}
    </div>
  );
}

export default CartPage;