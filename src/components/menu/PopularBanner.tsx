import { useNavigate } from "react-router-dom";

function PopularBanner() {
  const navigate = useNavigate();

  return (
    <div className="mb-8 rounded-3xl overflow-hidden bg-gradient-to-r from-red-700 via-red-600 to-orange-500 shadow-2xl">

      <div className="p-8">

        <p className="text-yellow-300 font-semibold">
          🔥 TODAY'S SPECIAL
        </p>

        <h2 className="text-4xl font-extrabold mt-2 text-white">
          Veg Biryani
        </h2>

        <p className="mt-3 text-red-100">
          Fresh • Hygienic • Delicious
        </p>

        <p className="mt-4 text-3xl font-bold text-white">
          ₹110
        </p>

        <button
          onClick={() => navigate("/menu")}
          className="mt-6 bg-white text-red-700 px-6 py-3 rounded-xl font-bold hover:scale-105 transition"
        >
          🍽 Order Now
        </button>

      </div>

    </div>
  );
}

export default PopularBanner;