interface Props {
  status: "Pending" | "Preparing" | "Ready" | "Completed";
}

export default function Badge({ status }: Props) {
  const styles = {
    Pending: "bg-yellow-500 text-black",
    Preparing: "bg-blue-600 text-white",
    Ready: "bg-green-600 text-white",
    Completed: "bg-gray-700 text-white",
  };

  return (
    <span
      className={`px-4 py-2 rounded-full text-sm font-bold ${styles[status]}`}
    >
      {status}
    </span>
  );
}