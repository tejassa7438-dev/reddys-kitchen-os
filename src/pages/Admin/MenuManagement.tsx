import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { menuService } from "../../services/menuService";
import { categoryService } from "../../services/categoryService";

import type {
  MenuItem,
  MenuFormData,
} from "../../types/menu";

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
  // =========================================
  // MENU STATE
  // =========================================

  const [items, setItems] =
    useState<MenuItem[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [category, setCategory] =
    useState("All");

  // =========================================
  // EDIT ITEM STATE
  // =========================================

  const [editingItem, setEditingItem] =
    useState<MenuItem | null>(null);

  const [form, setForm] =
    useState<MenuFormData>(
      initialForm
    );

  // =========================================
  // CATEGORY STATE
  // =========================================

  const [categoryName, setCategoryName] =
    useState("");

  const [managedCategories, setManagedCategories] =
    useState<string[]>([]);

  // =========================================
  // LOAD MENU + CATEGORIES
  // =========================================

  useEffect(() => {
    let categoriesSynced = false;

    const unsubscribeMenu =
      menuService.subscribe(
        async (data) => {
          setItems(data);
          setLoading(false);

          // Sync existing menu categories
          // into Firestore once per page load.

          if (!categoriesSynced) {
            categoriesSynced = true;

            const existingCategories =
              Array.from(
                new Set(
                  data
                    .map((item) =>
                      item.category.trim()
                    )
                    .filter(
                      (value) =>
                        value.length > 0
                    )
                )
              );

            for (
              const existingCategory
              of existingCategories
            ) {
              try {
                await categoryService.addCategory(
                  existingCategory
                );
              } catch (error) {
                console.error(
                  "Failed to sync category:",
                  existingCategory,
                  error
                );
              }
            }
          }
        }
      );

    const unsubscribeCategories =
      categoryService.subscribe(
        (data) => {
          setManagedCategories(data);
        }
      );

    return () => {
      unsubscribeMenu();
      unsubscribeCategories();
    };
  }, []);

  // =========================================
  // LOAD ITEM INTO EDIT FORM
  // =========================================

  useEffect(() => {
    if (editingItem) {
      setForm({
        name: editingItem.name,
        category: editingItem.category,
        description:
          editingItem.description,
        price: editingItem.price,
        image: editingItem.image,
        available:
          editingItem.available,
        featured:
          editingItem.featured,
      });
    } else {
      setForm(initialForm);
    }
  }, [editingItem]);

  // =========================================
  // COMBINE FIRESTORE CATEGORIES
  // + EXISTING ITEM CATEGORIES
  // =========================================

  const categories = useMemo(() => {
    const itemCategories =
      items
        .map((item) =>
          item.category.trim()
        )
        .filter(
          (value) =>
            value.length > 0
        );

    const combined = [
      ...managedCategories,
      ...itemCategories,
    ];

    const uniqueCategories: string[] = [];
    const seen = new Set<string>();

    for (const value of combined) {
      const normalized =
        value.toLowerCase();

      if (!seen.has(normalized)) {
        seen.add(normalized);
        uniqueCategories.push(value);
      }
    }

    return [
      "All",
      ...uniqueCategories,
    ];
  }, [
    items,
    managedCategories,
  ]);

  // =========================================
  // FILTER ITEMS
  // =========================================

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        item.name
          .toLowerCase()
          .includes(
            search.toLowerCase()
          );

      const matchesCategory =
        category === "All" ||
        item.category === category;

      return (
        matchesSearch &&
        matchesCategory
      );
    });
  }, [
    items,
    search,
    category,
  ]);

  // =========================================
  // RESET ITEM FORM
  // =========================================

  const resetForm = () => {
    setEditingItem(null);
    setForm(initialForm);
  };

  // =========================================
  // ADD CATEGORY
  // =========================================

  const addCategory = async () => {
    const cleanName =
      categoryName.trim();

    if (!cleanName) {
      toast.error(
        "Enter category name"
      );
      return;
    }

    const alreadyExists =
      categories.some(
        (cat) =>
          cat !== "All" &&
          cat.toLowerCase() ===
            cleanName.toLowerCase()
      );

    if (alreadyExists) {
      toast.error(
        "Category already exists"
      );
      return;
    }

    try {
      await categoryService.addCategory(
        cleanName
      );

      toast.success(
        "Category added"
      );

      setCategoryName("");
    } catch (error) {
      console.error(error);

      toast.error(
        "Failed to add category"
      );
    }
  };

  // =========================================
  // DELETE CATEGORY
  // =========================================

  const deleteCategory = async (
    categoryToDelete: string
  ) => {
    if (categoryToDelete === "All") {
      return;
    }

    // Check whether menu items are using
    // this category.

    const itemsUsingCategory =
      items.filter(
        (item) =>
          item.category.toLowerCase() ===
          categoryToDelete.toLowerCase()
      );

    // Do not allow deletion if items exist.

    if (itemsUsingCategory.length > 0) {
      toast.error(
        `"${categoryToDelete}" is being used by ${itemsUsingCategory.length} menu item${
          itemsUsingCategory.length === 1
            ? ""
            : "s"
        }. Remove or move those items first.`
      );

      return;
    }

    const confirmed =
      window.confirm(
        `Delete category "${categoryToDelete}"?`
      );

    if (!confirmed) {
      return;
    }

    try {
      await categoryService.deleteCategory(
        categoryToDelete
      );

      toast.success(
        "Category deleted"
      );

      // If currently filtering by the
      // deleted category, return to All.

      if (
        category === categoryToDelete
      ) {
        setCategory("All");
      }

      // If the edit form was using the
      // deleted category, clear it.

      if (
        form.category === categoryToDelete
      ) {
        setForm({
          ...form,
          category: "",
        });
      }
    } catch (error) {
      console.error(error);

      toast.error(
        "Failed to delete category"
      );
    }
  };

  // =========================================
  // SAVE MENU ITEM
  // =========================================

  const saveItem = async () => {
    if (!form.name.trim()) {
      toast.error(
        "Enter item name"
      );
      return;
    }

    if (!form.category.trim()) {
      toast.error(
        "Select category"
      );
      return;
    }

    if (form.price <= 0) {
      toast.error(
        "Invalid price"
      );
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
        await menuService.addItem(
          form
        );

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

  // =========================================
  // DELETE MENU ITEM
  // =========================================

  const deleteItem = async (
    id: string
  ) => {
    if (
      !window.confirm(
        "Delete this item?"
      )
    ) {
      return;
    }

    try {
      await menuService.deleteItem(
        id
      );

      toast.success(
        "Item deleted"
      );
    } catch (error) {
      console.error(error);

      toast.error(
        "Delete failed"
      );
    }
  };

  // =========================================
  // TOGGLE AVAILABILITY
  // =========================================

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
      } catch (error) {
        console.error(error);

        toast.error(
          "Update failed"
        );
      }
    };

  // =========================================
  // LOADING
  // =========================================

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading menu...
      </div>
    );
  }

  // =========================================
  // PAGE
  // =========================================

  return (
    <div className="min-h-screen bg-black text-white p-8">

      {/* ===================================== */}
      {/* HEADER */}
      {/* ===================================== */}

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

      {/* ===================================== */}
      {/* CATEGORY MANAGEMENT */}
      {/* ===================================== */}

      <div className="bg-zinc-900 rounded-2xl p-6 mb-8">

        <h2 className="text-2xl font-bold mb-5">
          Manage Categories
        </h2>

        <div className="flex flex-col md:flex-row gap-3">

          <input
            type="text"
            placeholder="New category name"
            value={categoryName}
            onChange={(e) =>
              setCategoryName(
                e.target.value
              )
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                addCategory();
              }
            }}
            className="flex-1 p-3 rounded-xl bg-zinc-800 border border-zinc-700 outline-none focus:border-red-500"
          />

          <button
            onClick={addCategory}
            className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-xl font-bold"
          >
            + Add Category
          </button>

        </div>

        {/* Existing Categories */}

        <div className="flex flex-wrap gap-2 mt-5">

          {categories
            .filter(
              (cat) =>
                cat !== "All"
            )
            .map((cat) => (

              <div
                key={cat}
                className="flex items-center gap-2 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-full"
              >

                <span className="text-sm text-gray-300">
                  {cat}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    deleteCategory(cat)
                  }
                  className="text-red-400 hover:text-red-300 font-bold text-lg leading-none"
                  title={`Delete ${cat}`}
                >
                  ×
                </button>

              </div>

            ))}

        </div>

      </div>

      {/* ===================================== */}
      {/* MAIN GRID */}
      {/* ===================================== */}

      <div className="grid lg:grid-cols-3 gap-8">

        {/* =================================== */}
        {/* ADD / EDIT ITEM */}
        {/* =================================== */}

        <div className="bg-zinc-900 rounded-2xl p-6">

          <h2 className="text-2xl font-bold mb-6">

            {editingItem
              ? "Edit Item"
              : "Add Item"}

          </h2>

          <div className="space-y-4">

            {/* Item Name */}

            <input
              type="text"
              placeholder="Item Name"
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name:
                    e.target.value,
                })
              }
              className="w-full p-3 rounded-xl bg-zinc-800 border border-zinc-700 outline-none focus:border-red-500"
            />

            {/* Category */}

            <select
              value={form.category}
              onChange={(e) =>
                setForm({
                  ...form,
                  category:
                    e.target.value,
                })
              }
              className="w-full p-3 rounded-xl bg-zinc-800 border border-zinc-700 outline-none focus:border-red-500"
            >

              <option value="">
                Select Category
              </option>

              {categories
                .filter(
                  (cat) =>
                    cat !== "All"
                )
                .map((cat) => (

                  <option
                    key={cat}
                    value={cat}
                  >
                    {cat}
                  </option>

                ))}

            </select>

            {/* Description */}

            <input
              type="text"
              placeholder="Description"
              value={form.description}
              onChange={(e) =>
                setForm({
                  ...form,
                  description:
                    e.target.value,
                })
              }
              className="w-full p-3 rounded-xl bg-zinc-800 border border-zinc-700 outline-none focus:border-red-500"
            />

            {/* Price */}

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
              className="w-full p-3 rounded-xl bg-zinc-800 border border-zinc-700 outline-none focus:border-red-500"
            />

            {/* Image */}

            <input
              type="text"
              placeholder="Image URL"
              value={form.image}
              onChange={(e) =>
                setForm({
                  ...form,
                  image:
                    e.target.value,
                })
              }
              className="w-full p-3 rounded-xl bg-zinc-800 border border-zinc-700 outline-none focus:border-red-500"
            />

            {/* Available */}

            <label className="flex items-center gap-3">

              <input
                type="checkbox"
                checked={
                  form.available
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    available:
                      e.target.checked,
                  })
                }
              />

              Available

            </label>

            {/* Featured */}

            <label className="flex items-center gap-3">

              <input
                type="checkbox"
                checked={
                  form.featured
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    featured:
                      e.target.checked,
                  })
                }
              />

              Featured Item

            </label>

            {/* Save Item */}

            <button
              onClick={saveItem}
              className="w-full bg-green-600 hover:bg-green-700 py-3 rounded-xl font-bold"
            >
              {editingItem
                ? "Update Item"
                : "Add Item"}
            </button>

          </div>

        </div>

        {/* =================================== */}
        {/* MENU ITEMS */}
        {/* =================================== */}

        <div className="lg:col-span-2 bg-zinc-900 rounded-2xl p-6">

          {/* Search + Category Filter */}

          <div className="flex flex-col md:flex-row gap-4 mb-6">

            <input
              type="text"
              placeholder="Search item..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              className="flex-1 p-3 rounded-xl bg-zinc-800 border border-zinc-700 outline-none focus:border-red-500"
            />

            <select
              value={category}
              onChange={(e) =>
                setCategory(
                  e.target.value
                )
              }
              className="p-3 rounded-xl bg-zinc-800 border border-zinc-700 outline-none focus:border-red-500"
            >

              {categories.map(
                (cat) => (

                  <option
                    key={cat}
                    value={cat}
                  >
                    {cat}
                  </option>

                )
              )}

            </select>

          </div>

          {/* Menu Items */}

          {filteredItems.length === 0 ? (

            <div className="text-center text-gray-400 py-12">
              No menu items found.
            </div>

          ) : (

            <div className="space-y-4">

              {filteredItems.map(
                (item) => (

                  <div
                    key={item.id}
                    className="bg-zinc-800 rounded-xl p-5 flex flex-col lg:flex-row justify-between gap-5"
                  >

                    {/* Item Details */}

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

                    {/* Actions */}

                    <div className="flex flex-wrap gap-3 items-center">

                      <button
                        onClick={() =>
                          setEditingItem(
                            item
                          )
                        }
                        className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          deleteItem(
                            item.id
                          )
                        }
                        className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg"
                      >
                        Delete
                      </button>

                      <button
                        onClick={() =>
                          toggleAvailability(
                            item
                          )
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

                )
              )}

            </div>

          )}

        </div>

      </div>

    </div>
  );
}

export default MenuManagement;