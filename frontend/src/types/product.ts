export type ProductSize = "small" | "medium" | "large";

export type Product = {
  id: number;
  name: string;
  pot: string;
  size: ProductSize;
  price: number;
  emoji: string;
  moisture: number;
  temp: number;
};
