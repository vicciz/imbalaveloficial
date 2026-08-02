import type { Product } from "../types/Product";

function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function applySeoDefaults(product: Product): Product {
  const baseTitle = product.title.trim();
  const baseDescription =
    product.shortDescription.trim() || product.description.replace(/<[^>]*>/g, "").slice(0, 160);

  const derivedTags = [
    product.category.name,
    product.brand.name,
    product.supplier.name,
  ]
    .map((value) => value.trim())
    .filter((value) => value.length > 0);

  return {
    ...product,
    seo: {
      title: product.seo.title.trim() || baseTitle,
      description: product.seo.description.trim() || baseDescription,
      slug: product.seo.slug.trim() || slugify(baseTitle),
      tags: product.seo.tags.length > 0 ? product.seo.tags : derivedTags,
    },
  };
}
