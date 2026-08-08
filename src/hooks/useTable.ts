import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useTableStore } from "../store/tableStore";

export function useTable() {
  const [params] = useSearchParams();

  const { table, setTable } = useTableStore();

  useEffect(() => {
    const tableNumber = Number(params.get("table"));

    if (!isNaN(tableNumber) && tableNumber > 0) {
      setTable(tableNumber);
    }
  }, [params, setTable]);

  return table;
}