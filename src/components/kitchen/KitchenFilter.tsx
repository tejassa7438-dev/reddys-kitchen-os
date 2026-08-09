import Button from "../ui/Button";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

const filters = [
  "All",
  "Pending",
  "Preparing",
  "Ready",
  "Completed",
];

export default function KitchenFilter({
  value,
  onChange,
}: Props) {
  return (
    <div className="flex flex-wrap gap-3 mb-8">
      {filters.map((filter) => (
        <Button
          key={filter}
          variant={
            value === filter
              ? "primary"
              : "secondary"
          }
          onClick={() => onChange(filter)}
        >
          {filter}
        </Button>
      ))}
    </div>
  );
}