import { motion } from "framer-motion";

interface Props {
  title: string;
  value: number;
  color: string;
  icon: React.ReactNode;
}

export default function StatCard({
  title,
  value,
  color,
  icon,
}: Props) {
  return (
    <motion.div
      whileHover={{ scale: 1.04 }}
      className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800"
    >
      <div className="flex justify-between items-center">

        <div>

          <p className="text-gray-400">
            {title}
          </p>

          <h1 className="text-4xl font-bold mt-3">
            {value}
          </h1>

        </div>

        <div
          className={`${color} w-14 h-14 rounded-xl flex items-center justify-center`}
        >
          {icon}
        </div>

      </div>
    </motion.div>
  );
}