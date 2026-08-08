import { useNavigate } from "react-router-dom";
import { useCartStore } from "../../store/cartStore";

function CartSummary() {
  const navigate = useNavigate();

  const items = useCartStore((state) => state.items);

  const totalItems = items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const totalPrice = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  if (items.length === 0) return null;

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 w-[92%] max-w-xl bg-red-600 text-white rounded-2xl shadow-2xl px-6 py-4 flex items-center justify-between">

      <div>
        <p className="font-bold text-lg">
          🛒 {totalItems} Item{totalItems > 1 ? "s" : ""}
        </p>

        <p>₹{totalPrice}</p>
      </div>

      <button
        onClick={() => navigate("/cart")}
        className="bg-white text-red-600 font-bold px-5 py-2 rounded-xl hover:bg-gray-100 transition"
      >
        View Cart →
      </button>

    </div>
  );
}

export default CartSummary;