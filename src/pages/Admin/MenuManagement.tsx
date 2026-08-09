import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { menuService } from "../../services/menuService";
import type { MenuItem, MenuFormData } from "../../types/menu";

const initialForm: MenuFormData = {
  name: "",
  category: "",
  description: "",
  price: 0,
  image: "",
  available: true,
  featured: false,
};

function MenuManagement() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [category, setCategory] = useState("All");

  const [editingItem, setEditingItem] =
    useState<MenuItem | null>(null);

  const [form, setForm] =
    useState<MenuFormData>(initialForm);

  useEffect(() => {
    const unsubscribe =
      menuService.subscribe((data) => {
        setItems(data);
        setLoading(false);
      });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (editingItem) {
      setForm({
        name: editingItem.name,
        category: editingItem.category,
        description:
          editingItem.description,
        price: editingItem.price,
        image: editingItem.image,
        available: editingItem.available,
        featured: editingItem.featured,
      });
    } else {
      setForm(initialForm);
    }
  }, [editingItem]);

  const categories = useMemo(() => {
    const list = items.map(
      (item) => item.category
    );

    return [
      "All",
      ...Array.from(new Set(list)),
    ];
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        item.name
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesCategory =
        category === "All" ||
        item.category === category;

      return (
        matchesSearch &&
        matchesCategory
      );
    });
  }, [items, search, category]);

  const resetForm = () => {
    setEditingItem(null);
    setForm(initialForm);
  };

  const saveItem = async () => {
    if (!form.name.trim()) {
      toast.error("Enter item name");
      return;
    }

    if (!form.category.trim()) {
      toast.error("Enter category");
      return;
    }

    if (form.price <= 0) {
      toast.error("Invalid price");
      return;
    }

    try {
      if (editingItem) {
        await menuService.updateItem(
          editingItem.id,
          form
        );

        toast.success(
          "Item updated"
        );
      } else {
        await menuService.addItem(form);

        toast.success(
          "Item added"
        );
      }

      resetForm();
    } catch (error) {
      console.error(error);

      toast.error(
        "Failed to save item"
      );
    }
  };

  const deleteItem = async (
    id: string
  ) => {
    if (
      !window.confirm(
        "Delete this item?"
      )
    )
      return;

    try {
      await menuService.deleteItem(id);

      toast.success(
        "Item deleted"
      );
    } catch {
      toast.error(
        "Delete failed"
      );
    }
  };

  const toggleAvailability =
    async (item: MenuItem) => {
      try {
        await menuService.toggleAvailability(
          item.id,
          !item.available
        );

        toast.success(
          "Availability updated"
        );
      } catch {
        toast.error(
          "Update failed"
        );
      }
    };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading menu...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">

      <div className="flex justify-between items-center mb-8">

        <h1 className="text-4xl font-bold text-red-500">
          Menu Management
        </h1>

        <button
          onClick={resetForm}
          className="bg-red-600 hover:bg-red-700 px-5 py-3 rounded-xl font-semibold"
        >
          New Item
        </button>

      </div>

      <div className="grid lg:grid-cols-3 gap-8">

        <div className="bg-zinc-900 rounded-2xl p-6">

          <h2 className="text-2xl font-bold mb-6">

            {editingItem
              ? "Edit Item"
              : "Add Item"}

          </h2>

          <div className="space-y-4">

            <input
              placeholder="Item Name"
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value,
                })
              }
              className="w-full p-3 rounded-xl bg-zinc-800"
            />

            <input
              placeholder="Category"
              value={form.category}
              onChange={(e) =>
                setForm({
                  ...form,
                  category:
                    e.target.value,
                })
              }
              className="w-full p-3 rounded-xl bg-zinc-800"
            />

            <input
              placeholder="Description"
              value={form.description}
              onChange={(e) =>
                setForm({
                  ...form,
                  description:
                    e.target.value,
                })
              }
              className="w-full p-3 rounded-xl bg-zinc-800"
            />

            <input
              type="number"
              placeholder="Price"
              value={form.price}
              onChange={(e) =>
                setForm({
                  ...form,
                  price: Number(
                    e.target.value
                  ),
                })
              }
              className="w-full p-3 rounded-xl bg-zinc-800"
            />

            <input
              placeholder="Image URL"
              value={form.image}
              onChange={(e) =>
                setForm({
                  ...form,
                  image:
                    e.target.value,
                })
              }
              className="w-full p-3 rounded-xl bg-zinc-800"
            />            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={form.available}
                onChange={(e) =>
                  setForm({
                    ...form,
                    available: e.target.checked,
                  })
                }
              />
              Available
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) =>
                  setForm({
                    ...form,
                    featured: e.target.checked,
                  })
                }
              />
              Featured Item
            </label>

            <button
              onClick={saveItem}
              className="w-full bg-green-600 hover:bg-green-700 py-3 rounded-xl font-bold"
            >
              {editingItem ? "Update Item" : "Add Item"}
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 bg-zinc-900 rounded-2xl p-6">

          <div className="flex flex-col md:flex-row gap-4 mb-6">

            <input
              placeholder="Search item..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="flex-1 p-3 rounded-xl bg-zinc-800"
            />

            <select
              value={category}
              onChange={(e) =>
                setCategory(e.target.value)
              }
              className="p-3 rounded-xl bg-zinc-800"
            >
              {categories.map((cat) => (
                <option
                  key={cat}
                  value={cat}
                >
                  {cat}
                </option>
              ))}
            </select>

          </div>

          {filteredItems.length === 0 ? (
            <div className="text-center text-gray-400 py-12">
              No menu items found.
            </div>
          ) : (
            <div className="space-y-4">

              {filteredItems.map((item) => (

                <div
                  key={item.id}
                  className="bg-zinc-800 rounded-xl p-5 flex flex-col lg:flex-row justify-between gap-5"
                >

                  <div className="flex gap-5">

                    <img
                      src={
                        item.image ||
                        "https://placehold.co/100x100"
                      }
                      alt={item.name}
                      className="w-24 h-24 rounded-xl object-cover"
                    />

                    <div>

                      <h2 className="text-2xl font-bold">
                        {item.name}
                      </h2>

                      <p className="text-gray-400">
                        {item.category}
                      </p>

                      <p className="mt-2">
                        {item.description}
                      </p>

                      <p className="text-yellow-400 font-bold mt-3">
                        ₹{item.price}
                      </p>

                    </div>

                  </div>

                  <div className="flex flex-wrap gap-3 items-center">

                    <button
                      onClick={() =>
                        setEditingItem(item)
                      }
                      className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() =>
                        deleteItem(item.id)
                      }
                      className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg"
                    >
                      Delete
                    </button>

                    <button
                      onClick={() =>
                        toggleAvailability(item)
                      }
                      className={`px-4 py-2 rounded-lg font-semibold ${
                        item.available
                          ? "bg-green-600"
                          : "bg-gray-600"
                      }`}
                    >
                      {item.available
                        ? "Available"
                        : "Unavailable"}
                    </button>

                  </div>

                </div>

              ))}

            </div>
          )}

        </div>

      </div>

    </div>
  );
}

export default MenuManagement;