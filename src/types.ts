export interface Shoe {
  id: string | number;
  name: string;
  brand: string;
  price: number;
  category: string;
  description: string;
  image_url: string;
  color: string;
  sizes: string[];
  colors: string[];
  additional_images?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem extends Shoe {
  quantity: number;
  selectedSize: string;
  selectedColor: string;
}

export interface Brand {
  id: string | number;
  name: string;
  logo: string;
  description: string;
  founded_year?: number;
  country?: string;
  website?: string;
  featured: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  category: string;
  date: string;
  image: string;
  excerpt: string;
  content: string;
  author: string;
  createdAt?: string;
  updatedAt?: string;
}