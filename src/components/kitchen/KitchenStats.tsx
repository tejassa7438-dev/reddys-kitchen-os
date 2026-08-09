interface Props {
  pending: number;
  preparing: number;
  ready: number;
  completed: number;
}

export default function KitchenStats({
  pending,
  preparing,
  ready,
  completed,
}: Props) {
  const cards = [
    {
      title: "Pending",
      value: pending,
      color: "bg-yellow-500",
    },
    {
      title: "Preparing",
      value: preparing,
      color: "bg-blue-500",
    },
    {
      title: "Ready",
      value: ready,
      color: "bg-green-500",
    },
    {
      title: "Completed",
      value: completed,
      color: "bg-zinc-700",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
      {cards.map((card) => (
        <div
          key={card.title}
          className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800"
        >
          <div className="text-gray-400">
            {card.title}
          </div>

          <div className="text-4xl font-bold mt-3">
            {card.value}
          </div>

          <div
            className={`${card.color} h-2 rounded-full mt-4`}
          />
        </div>
      ))}
    </div>
  );
}