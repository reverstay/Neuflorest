import type { Product } from "../../types/product";

type ProductCardProps = {
  product: Product;
  sizeLabel: string;
  pricePrefix: string;
  addLabel: string;
  addedLabel: string;
  isAdded: boolean;
  onAdd: (productId: number) => void;
};

export function ProductCard({
  product,
  sizeLabel,
  pricePrefix,
  addLabel,
  addedLabel,
  isAdded,
  onAdd,
}: ProductCardProps) {
  return (
    <article className="product-card">
      <div className="product-img">
        {product.emoji}
        <span className="product-badge">{sizeLabel}</span>
      </div>
      <div className="product-body">
        <div className="product-name">{product.name}</div>
        <div className="product-pot">{product.pot}</div>
        <div className="product-footer">
          <span className="product-price">
            {pricePrefix}
            {product.price}
          </span>
          <button className="btn-add" onClick={() => onAdd(product.id)} type="button">
            {isAdded ? addedLabel : addLabel}
          </button>
        </div>
      </div>
    </article>
  );
}
