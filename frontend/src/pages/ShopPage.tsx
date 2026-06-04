import { useMemo, useState } from "react";

import { ProductCard } from "../components/product/ProductCard";
import { PRODUCTS } from "../data/products";
import { useLang } from "../contexts/language/LangProvider";
import { PRODUCT_SIZE_LABEL_KEYS, TRANSLATIONS } from "../i18n/translations";
import type { ProductSize } from "../types/product";

type FilterValue = ProductSize | "all";

export function ShopPage() {
  const { lang } = useLang();
  const t = TRANSLATIONS[lang].shop;
  const [filter, setFilter] = useState<FilterValue>("all");
  const [added, setAdded] = useState<Record<number, boolean>>({});

  const filteredProducts = useMemo(
    () => (filter === "all" ? PRODUCTS : PRODUCTS.filter((product) => product.size === filter)),
    [filter],
  );

  function handleAdd(productId: number) {
    setAdded((current) => ({ ...current, [productId]: true }));
    window.setTimeout(() => {
      setAdded((current) => ({ ...current, [productId]: false }));
    }, 1800);
  }

  return (
    <div className="page">
      <div className="container">
        <div className="shop-header">
          <h1 className="page-title">{t.title}</h1>
          <p className="page-subtitle">
            {PRODUCTS.length} {t.productCount}
          </p>
        </div>
        <div className="filter-bar" aria-label={t.filter}>
          {[
            ["all", t.filterAll],
            ["small", t.filterSmall],
            ["medium", t.filterMedium],
            ["large", t.filterLarge],
          ].map(([value, label]) => (
            <button
              key={value}
              className={`filter-btn ${filter === value ? "active" : ""}`}
              onClick={() => setFilter(value as FilterValue)}
              type="button"
            >
              {label}
            </button>
          ))}
        </div>
        <div className="products-grid">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              sizeLabel={t[PRODUCT_SIZE_LABEL_KEYS[product.size]]}
              pricePrefix={t.price}
              addLabel={t.addCart}
              addedLabel={t.added}
              isAdded={Boolean(added[product.id])}
              onAdd={handleAdd}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
