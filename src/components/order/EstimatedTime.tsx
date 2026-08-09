interface Props {
  status: string;
}

export default function EstimatedTime({
  status,
}: Props) {
  let text = "20-25 mins";

  if (status === "Preparing")
    text = "10-15 mins";

  if (status === "Ready")
    text = "Ready for Pickup";

  if (status === "Completed")
    text = "Order Completed";

  return (
    <div className="mt-8 bg-zinc-900 rounded-2xl p-5">

      <h3 className="text-gray-400">
        Estimated Time
      </h3>

      <h2 className="text-3xl font-bold mt-2 text-yellow-400">
        {text}
      </h2>

    </div>
  );
}