import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "../../store/cartStore";

function CheckoutPage() {
  const navigate = useNavigate();

  const { items } = useCartStore();

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [instructions, setInstructions] = useState("");

  const total = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      ),
    [items]
  );

  const placeOrder = () => {
    if (items.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    if (customerName.trim() === "") {
      alert("Please enter your name.");
      return;
    }

    alert("Order placed successfully!");

    console.log({
      customer: customerName,
      phone,
      instructions,
      items,
      total,
    });
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">

      <button
        onClick={() => navigate("/cart")}
        className="text-red-500 mb-6"
      >
        ← Back to Cart
      </button>

      <h1 className="text-4xl font-bold text-red-600">
        Checkout
      </h1>

      <div className="mt-8 space-y-5">

        <input
          placeholder="Customer Name"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          className="w-full bg-zinc-900 rounded-xl p-4 outline-none"
        />

        <input
          placeholder="Phone Number (Optional)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full bg-zinc-900 rounded-xl p-4 outline-none"
        />

        <textarea
          placeholder="Special Instructions"
          rows={4}
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          className="w-full bg-zinc-900 rounded-xl p-4 outline-none"
        />

      </div>

      <div className="mt-10 bg-zinc-900 rounded-2xl p-6">

        <h2 className="text-2xl font-bold mb-4">
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

        <div className="border-t border-zinc-700 mt-5 pt-5 flex justify-between text-2xl font-bold">

          <span>Total</span>

          <span className="text-yellow-400">
            ₹{total}
          </span>

        </div>

      </div>

      <button
        onClick={placeOrder}
        className="mt-8 w-full bg-green-600 hover:bg-green-700 py-4 rounded-xl text-xl font-bold"
      >
        Place Order
      </button>

    </div>
  );
}

export default CheckoutPage;