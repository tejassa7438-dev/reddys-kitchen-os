import { useSearchParams } from "react-router-dom";

function useTable() {
  const [searchParams] = useSearchParams();

  const table = searchParams.get("table");

  return table ?? "Unknown";
}

export default useTable;