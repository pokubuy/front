import { Offer } from './offer.model';

export interface CatalogPage {
  readonly items: readonly Offer[];
  readonly total: number;
}
