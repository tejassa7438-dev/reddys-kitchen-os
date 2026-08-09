import { ChefHat } from "lucide-react";

export default function KitchenHeader() {
  return (
    <div className="flex justify-between items-center mb-10">

      <div className="flex items-center gap-4">

        <ChefHat
          size={42}
          className="text-red-500"
        />

        <div>

          <h1 className="text-4xl font-bold">
            Kitchen Dashboard
          </h1>

          <p className="text-gray-400">
            REDDY'S KITCHEN
          </p>

        </div>

      </div>

    </div>
  );
}