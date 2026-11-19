export type CatalogSort = 'popular' | 'rating' | 'price-asc' | 'price-desc' | 'newest';

export interface CatalogQuery {
  readonly search?: string;
  readonly categoryId?: string;
  readonly favoriteIds?: readonly string[];
  readonly sort?: CatalogSort;
  readonly limit?: number;
}
