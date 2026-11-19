import { firstValueFrom } from 'rxjs';
import { CatalogService } from './catalog.service';

describe('CatalogService', () => {
  it('generates identical entities for independent SSR and browser instances', async () => {
    const server = await firstValueFrom(new CatalogService().getOffers({ limit: 1000 }));
    const browser = await firstValueFrom(new CatalogService().getOffers({ limit: 1000 }));
    expect(server).toEqual(browser);
    expect(new Set(server.items.map((offer) => offer.id)).size).toBe(server.total);
  });

  it('combines search and category selection', async () => {
    const service = new CatalogService();
    const all = await firstValueFrom(service.getOffers({ limit: 1000 }));
    const sample = all.items[0];
    const filtered = await firstValueFrom(
      service.getOffers({
        search: `  ${sample.platform.toUpperCase()}  `,
        categoryId: sample.categoryId,
        limit: 1000,
      }),
    );
    expect(filtered.items).toContainEqual(sample);
    expect(
      filtered.items.every(
        (offer) => offer.platform === sample.platform && offer.categoryId === sample.categoryId,
      ),
    ).toBe(true);
  });

  it('sorts before pagination and preserves the total', async () => {
    const service = new CatalogService();
    const small = await firstValueFrom(service.getOffers({ sort: 'price-asc', limit: 12 }));
    const expanded = await firstValueFrom(service.getOffers({ sort: 'price-asc', limit: 24 }));
    expect(expanded.items.slice(0, 12)).toEqual(small.items);
    expect(small.total).toBe(expanded.total);
    expect(
      expanded.items.every(
        (offer, index, items) => index === 0 || offer.price >= items[index - 1].price,
      ),
    ).toBe(true);
  });

  it('supports empty favorites, explicit favorites and unknown offer IDs', async () => {
    const service = new CatalogService();
    expect((await firstValueFrom(service.getOffers({ favoriteIds: [] }))).total).toBe(0);
    const favorites = await firstValueFrom(service.getOffers({ favoriteIds: ['offer-1'] }));
    expect(favorites.items.map((offer) => offer.id)).toEqual(['offer-1']);
    expect(await firstValueFrom(service.getOffer('missing'))).toBeUndefined();
    expect((await firstValueFrom(service.getOffers({ search: 'no-such-product' }))).total).toBe(0);
  });
});
