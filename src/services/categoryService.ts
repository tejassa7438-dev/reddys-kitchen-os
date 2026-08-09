import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
} from "firebase/firestore";

import { db } from "./firebase";

const categoriesCollection =
  collection(db, "categories");

const normalizeCategory = (
  name: string
) => {
  return name
    .trim()
    .replace(/\s+/g, " ");
};

const categoryId = (
  name: string
) => {
  return normalizeCategory(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
};

export const categoryService = {

  // -----------------------------------------
  // Subscribe to categories
  // -----------------------------------------

  subscribe(
    callback: (categories: string[]) => void
  ) {
    const q = query(
      categoriesCollection,
      orderBy("name", "asc")
    );

    return onSnapshot(q, (snapshot) => {

      const categories =
        snapshot.docs.map(
          (item) =>
            item.data().name as string
        );

      callback(categories);
    });
  },

  // -----------------------------------------
  // Add category
  // -----------------------------------------

  async addCategory(
    name: string
  ) {
    const cleanName =
      normalizeCategory(name);

    if (!cleanName) {
      throw new Error(
        "Category name is required."
      );
    }

    const id =
      categoryId(cleanName);

    if (!id) {
      throw new Error(
        "Invalid category name."
      );
    }

    await setDoc(
      doc(
        db,
        "categories",
        id
      ),
      {
        name: cleanName,
        normalizedName:
          cleanName.toLowerCase(),
        createdAt:
          new Date().toISOString(),
      },
      {
        merge: true,
      }
    );
  },

  // -----------------------------------------
  // Delete category
  // -----------------------------------------

  async deleteCategory(
    name: string
  ) {
    const id =
      categoryId(name);

    await deleteDoc(
      doc(
        db,
        "categories",
        id
      )
    );
  },
};