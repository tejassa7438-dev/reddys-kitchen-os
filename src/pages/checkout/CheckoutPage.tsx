import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useCartStore } from "../../store/cartStore";
import { useTableStore } from "../../store/tableStore";
import { orderService } from "../../services/orderService";

function CheckoutPage() {
  const navigate = useNavigate();

  const { items, clearCart } = useCartStore();
  const { table } = useTableStore();

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [instructions, setInstructions] = useState("");

  const total = useMemo(() => {
    return items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  }, [items]);

  const placeOrder = async () => {
    if (items.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    if (!customerName.trim()) {
      alert("Please enter your name.");
      return;
    }

    const order = {
      id: Date.now().toString(),
      table,
      customerName,
      phone,
      instructions,
      items,
      total,
      status: "Pending" as const,
      createdAt: new Date().toISOString(),
    };

    try {
      await orderService.placeOrder(order);

      clearCart();

      navigate("/success");
    } catch (error) {
      console.error(error);
      alert("Failed to place order.");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">

      <button
        onClick={() => navigate("/cart")}
        className="text-red-500 hover:text-red-400 mb-6"
      >
        ← Back to Cart
      </button>

      <h1 className="text-4xl font-bold text-red-600">
        Checkout
      </h1>

      <p className="mt-2 text-gray-400">
        Table {table}
      </p>

      <div className="mt-8 space-y-5">

        <input
          type="text"
          placeholder="Customer Name"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          className="w-full bg-zinc-900 rounded-xl p-4 border border-zinc-700 outline-none focus:border-red-500"
        />

        <input
          type="tel"
          placeholder="Phone Number (Optional)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full bg-zinc-900 rounded-xl p-4 border border-zinc-700 outline-none focus:border-red-500"
        />

        <textarea
          rows={4}
          placeholder="Special Instructions (Optional)"
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          className="w-full bg-zinc-900 rounded-xl p-4 border border-zinc-700 outline-none focus:border-red-500"
        />

      </div>

      <div className="mt-10 bg-zinc-900 rounded-2xl p-6">

        <h2 className="text-2xl font-bold mb-5">
          Order Summary
        </h2>

        {items.map((item) => (
          <div
            key={item.id}
            className="flex justify-between py-2"
          >
            <span>
              {item.name} × {item.quantity}
            </span>

            <span>
              ₹{item.price * item.quantity}
            </span>
          </div>
        ))}

        <div className="border-t border-zinc-700 mt-6 pt-6 flex justify-between text-2xl font-bold">

          <span>Total</span>

          <span className="text-yellow-400">
            ₹{total}
          </span>

        </div>

      </div>

      <button
        onClick={placeOrder}
        className="w-full mt-8 bg-green-600 hover:bg-green-700 py-4 rounded-xl text-xl font-bold transition"
      >
        Place Order
      </button>

    </div>
  );
}

export default CheckoutPage;