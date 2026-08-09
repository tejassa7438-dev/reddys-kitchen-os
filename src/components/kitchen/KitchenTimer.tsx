import { useEffect, useState } from "react";

interface Props {
  createdAt: string;
}

export default function KitchenTimer({
  createdAt,
}: Props) {
  const [minutes, setMinutes] = useState(0);

  useEffect(() => {
    const update = () => {
      const diff =
        Date.now() -
        new Date(createdAt).getTime();

      setMinutes(Math.floor(diff / 60000));
    };

    update();

    const timer = setInterval(update, 1000);

    return () => clearInterval(timer);
  }, [createdAt]);

  return (
    <span className="text-gray-400">
      ⏱ {minutes} min ago
    </span>
  );
}