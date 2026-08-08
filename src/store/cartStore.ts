import { create } from "zustand";

type CartItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
};

type CartStore = {
  items: CartItem[];

  addItem: (item: Omit<CartItem, "quantity">) => void;
  decreaseItem: (id: number) => void;
  clearCart: () => void;
};

export const useCartStore = create<CartStore>((set) => ({
  items: [],

  addItem: (item) =>
    set((state) => {
      const existing = state.items.find((i) => i.id === item.id);

      if (existing) {
        return {
          items: state.items.map((i) =>
            i.id === item.id
              ? { ...i, quantity: i.quantity + 1 }
              : i
          ),
        };
      }

      return {
        items: [
          ...state.items,
          {
            ...item,
            quantity: 1,
          },
        ],
      };
    }),

  decreaseItem: (id) =>
    set((state) => ({
      items: state.items
        .map((i) =>
          i.id === id
            ? { ...i, quantity: i.quantity - 1 }
            : i
        )
        .filter((i) => i.quantity > 0),
    })),

  clearCart: () =>
    set({
      items: [],
    }),
}));