import { useNavigate } from "react-router-dom";

function OrderSuccessPage() {
  const navigate = useNavigate();

  const trackOrder = () => {
    const orderId = localStorage.getItem("activeOrderId");

    if (!orderId) {
      alert("Order tracking information is unavailable.");
      return;
    }

    navigate(`/track/${orderId}`);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-5">

      <div className="text-7xl">
        🎉
      </div>

      <h1 className="text-5xl font-bold text-green-500 mt-6 text-center">
        Order Placed!
      </h1>

      <p className="text-gray-400 mt-4 text-center max-w-md">
        Thank you for ordering from
        <br />
        <span className="text-yellow-400 font-bold">
          REDDY'S KITCHEN
        </span>
      </p>

      <div className="bg-zinc-900 rounded-2xl p-6 mt-10 w-full max-w-md">

        <div className="flex justify-between">
          <span>Order Status</span>

          <span className="text-yellow-400">
            Pending
          </span>
        </div>

        <div className="flex justify-between mt-4">
          <span>Estimated Time</span>

          <span>
            20–25 mins
          </span>
        </div>

      </div>

      {/* Track Order */}
      <button
        onClick={trackOrder}
        className="mt-8 w-full max-w-md bg-green-600 hover:bg-green-700 px-8 py-4 rounded-xl font-bold transition"
      >
        📍 Track My Order
      </button>

      {/* Back Home */}
      <button
        onClick={() => navigate("/")}
        className="mt-4 w-full max-w-md bg-red-600 hover:bg-red-700 px-8 py-4 rounded-xl font-bold transition"
      >
        Back to Home
      </button>

    </div>
  );
}

export default OrderSuccessPage;