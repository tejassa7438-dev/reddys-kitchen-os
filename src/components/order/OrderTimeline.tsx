interface Props {
  status: "Pending" | "Preparing" | "Ready" | "Completed";
}

export default function OrderTimeline({ status }: Props) {
  const steps = [
    "Pending",
    "Preparing",
    "Ready",
    "Completed",
  ];

  const current = steps.indexOf(status);

  return (
    <div className="mt-10 grid grid-cols-4 gap-3">

      {steps.map((step, index) => (

        <div
          key={step}
          className="text-center"
        >

          <div
            className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center font-bold ${
              index <= current
                ? "bg-green-600"
                : "bg-zinc-700"
            }`}
          >
            {index + 1}
          </div>

          <p className="mt-3 text-sm">
            {step}
          </p>

        </div>

      ))}

    </div>
  );
}