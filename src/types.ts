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