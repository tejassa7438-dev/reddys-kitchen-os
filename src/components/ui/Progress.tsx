interface Props {
  value: number;
}

export default function Progress({ value }: Props) {
  return (
    <div className="w-full h-4 bg-zinc-800 rounded-full overflow-hidden">
      <div
        className="bg-red-600 h-full transition-all duration-700"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}