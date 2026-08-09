export interface MenuItem {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  image: string;
  available: boolean;
  featured: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface MenuFormData {
  name: string;
  category: string;
  description: string;
  price: number;
  image: string;
  available: boolean;
  featured: boolean;
}