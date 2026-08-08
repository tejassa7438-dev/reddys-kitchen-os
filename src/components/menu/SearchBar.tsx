type Props = {
  value: string;
  onChange: (value: string) => void;
};

function SearchBar({ value, onChange }: Props) {
  return (
    <input
      type="text"
      placeholder="Search your favourite dish..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-zinc-900 text-white rounded-xl px-5 py-4 outline-none border border-zinc-700 focus:border-red-500"
    />
  );
}

export default SearchBar;