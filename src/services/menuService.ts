import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";

import { db } from "./firebase";
import type { MenuFormData, MenuItem } from "../types/menu";

const menuCollection = collection(db, "menu");

export const menuService = {
  async getMenu(): Promise<MenuItem[]> {
    const q = query(menuCollection, orderBy("displayOrder"));

    const snapshot = await getDocs(q);

    return snapshot.docs.map((d) => ({
      ...(d.data() as MenuItem),
      id: d.id,
    }));
  },

  subscribe(callback: (items: MenuItem[]) => void) {
    const q = query(menuCollection, orderBy("displayOrder"));

    return onSnapshot(q, (snapshot) => {
      callback(
        snapshot.docs.map((d) => ({
          ...(d.data() as MenuItem),
          id: d.id,
        }))
      );
    });
  },

  async addItem(data: MenuFormData) {
    const now = new Date().toISOString();

    await addDoc(menuCollection, {
      ...data,
      createdAt: now,
      updatedAt: now,
      displayOrder: Date.now(),
    });
  },

  async updateItem(id: string, data: Partial<MenuFormData>) {
    await updateDoc(doc(db, "menu", id), {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  },

  async deleteItem(id: string) {
    await deleteDoc(doc(db, "menu", id));
  },

  async toggleAvailability(id: string, available: boolean) {
    await updateDoc(doc(db, "menu", id), {
      available,
      updatedAt: new Date().toISOString(),
    });
  },
};