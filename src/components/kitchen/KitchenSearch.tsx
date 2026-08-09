import { Search } from "lucide-react";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function KitchenSearch({
  value,
  onChange,
}: Props) {
  return (
    <div className="relative mb-8">

      <Search
        size={20}
        className="absolute left-4 top-4 text-gray-500"
      />

      <input
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        placeholder="Search table..."
        className="bg-zinc-900 w-full rounded-xl py-4 pl-12 border border-zinc-800 outline-none focus:border-red-600"
      />

    </div>
  );
}