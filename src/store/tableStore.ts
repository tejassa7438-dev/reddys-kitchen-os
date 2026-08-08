import { create } from "zustand";

type TableStore = {
  table: number;
  setTable: (table: number) => void;
};

export const useTableStore = create<TableStore>((set) => ({
  table: 1,
  setTable: (table) => set({ table }),
}));