interface Props {
  status: "Pending" | "Preparing" | "Ready" | "Completed";
}

export default function OrderProgress({ status }: Props) {
  const percentage = {
    Pending: 25,
    Preparing: 60,
    Ready: 100,
    Completed: 100,
  }[status];

  const color = {
    Pending: "bg-yellow-500",
    Preparing: "bg-blue-500",
    Ready: "bg-green-500",
    Completed: "bg-green-600",
  }[status];

  return (
    <div className="w-full mt-8">

      <div className="flex justify-between text-sm text-gray-400 mb-2">
        <span>Order Progress</span>
        <span>{percentage}%</span>
      </div>

      <div className="w-full bg-zinc-800 h-4 rounded-full overflow-hidden">

        <div
          className={`${color} h-4 transition-all duration-700`}
          style={{ width: `${percentage}%` }}
        />

      </div>

    </div>
  );
}