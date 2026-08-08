import { useNavigate } from "react-router-dom";

function OrderSuccessPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center px-6">

      <div className="text-7xl">
        🎉
      </div>

      <h1 className="text-5xl font-bold text-green-500 mt-6">
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

          <span>20–25 mins</span>
        </div>

      </div>

      <button
        onClick={() => navigate("/")}
        className="mt-10 bg-red-600 hover:bg-red-700 px-8 py-4 rounded-xl font-bold"
      >
        Back to Home
      </button>

    </div>
  );
}

export default OrderSuccessPage;