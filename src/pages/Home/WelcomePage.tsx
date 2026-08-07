import { useNavigate } from "react-router-dom";
import { restaurant } from "../../constants/restaurant";

function WelcomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6">
      
      <h2 className="text-4xl font-bold text-red-600">
        Welcome 👋
      </h2>

      <p className="mt-3 text-2xl text-yellow-400 font-semibold">
        {restaurant.name}
      </p>

      <p className="mt-2 text-gray-400">
        {restaurant.slogan}
      </p>

      <div className="mt-10 bg-zinc-900 rounded-2xl p-8 w-full max-w-md text-center shadow-xl">
        
        <p className="text-gray-400">
          You are ordering for
        </p>

        <h1 className="text-5xl font-bold mt-2 text-white">
          TABLE 5
        </h1>

        <button
          onClick={() => navigate("/menu")}
          className="mt-8 w-full bg-red-600 hover:bg-red-700 rounded-xl py-4 text-lg font-semibold transition duration-300"
        >
          🍽 Browse Menu
        </button>

      </div>

    </div>
  );
}

export default WelcomePage;