export interface Shoe {
  id: string | number;
  name: string;
  brand: string;
  price: number;
  category: string;
  description: string;
  image_url: string;
  color: string;
}

export interface CartItem extends Shoe {
  quantity: number;
}
