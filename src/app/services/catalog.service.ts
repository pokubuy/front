import { Service } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Category } from '../models/catalog/category.model';
import { CatalogPage } from '../models/catalog/catalog-page.model';
import { CatalogQuery } from '../models/catalog/catalog-query.model';
import { Offer } from '../models/catalog/offer.model';

// Vocabulary for the generator, not hand-authored offer/seller fixtures.
const taxonomy = [
  {
    id: 'top-ups',
    name: 'Пополнение',
    icon: 'bolt',
    action: 'Пополнение баланса',
    platforms: ['Steam', 'PlayStation', 'Xbox'],
  },
  {
    id: 'subscriptions',
    name: 'Подписки',
    icon: 'sparkles',
    action: 'Подписка',
    platforms: ['Telegram Premium', 'Discord Nitro', 'Spotify'],
  },
  {
    id: 'currency',
    name: 'Игровая валюта',
    icon: 'coins',
    action: 'Игровая валюта',
    platforms: ['Genshin Impact', 'Roblox', 'PUBG Mobile'],
  },
  {
    id: 'games',
    name: 'Игры и ключи',
    icon: 'key',
    action: 'Ключ активации',
    platforms: ['Minecraft', 'Forza Horizon', 'Stardew Valley'],
  },
  {
    id: 'accounts',
    name: 'Аккаунты',
    icon: 'user',
    action: 'Игровой аккаунт',
    platforms: ['Valorant', 'Fortnite', 'World of Tanks'],
  },
  {
    id: 'services',
    name: 'Услуги',
    icon: 'gamepad',
    action: 'Помощь в игре',
    platforms: ['Dota 2', 'Counter-Strike 2', 'League of Legends'],
  },
  {
    id: 'gift-cards',
    name: 'Подарочные карты',
    icon: 'gift',
    action: 'Подарочная карта',
    platforms: ['Apple', 'Google Play', 'Nintendo'],
  },
  {
    id: 'software',
    name: 'Софт и сервисы',
    icon: 'grid',
    action: 'Лицензия',
    platforms: ['Windows', 'Office', 'Canva'],
  },
] as const;

@Service()
export class CatalogService {
  // Fixed seed: identical SSR and hydration, no Math.random/Date.now.
  private readonly offers: readonly Offer[] = Array.from({ length: 192 }, (_, index) =>
    this.generateOffer(index),
  );

  getCategories(): Observable<readonly Category[]> {
    return of(
      taxonomy.map((category) => ({
        id: category.id,
        name: category.name,
        icon: category.icon,
        offerCount: this.offers.filter((offer) => offer.categoryId === category.id).length,
      })),
    );
  }

  getOffers(query: CatalogQuery = {}): Observable<CatalogPage> {
    const search = (query.search ?? '').trim().toLocaleLowerCase('ru');
    const matches = this.offers.filter(
      (offer) =>
        (!query.categoryId || offer.categoryId === query.categoryId) &&
        (!search ||
          `${offer.title} ${offer.description} ${offer.seller.name}`
            .toLocaleLowerCase('ru')
            .includes(search)) &&
        (query.favoriteIds === undefined || query.favoriteIds.includes(offer.id)),
    );
    matches.sort((a, b) => {
      switch (query.sort) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating || b.reviewCount - a.reviewCount;
        case 'newest':
          return b.publishedAt - a.publishedAt;
        default:
          return b.sales - a.sales;
      }
    });
    return of({ items: matches.slice(0, Math.max(0, query.limit ?? 12)), total: matches.length });
  }

  getOffer(id: string): Observable<Offer | undefined> {
    return of(this.offers.find((offer) => offer.id === id));
  }

  private generateOffer(index: number): Offer {
    const category = taxonomy[index % taxonomy.length];
    const platform =
      category.platforms[Math.floor(index / taxonomy.length) % category.platforms.length];
    let seed = Math.imul(index + 1701, 2654435761) >>> 0;
    const next = () => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    const quantity = 1 + Math.floor(next() * 12);
    const price =
      category.id === 'top-ups' || category.id === 'gift-cards'
        ? Math.round(quantity * 500 * (1.03 + next() * 0.15))
        : (10 + Math.floor(next() * 240)) * 10 - 1;
    const variant =
      category.id === 'subscriptions' || category.id === 'software'
        ? `${quantity} мес.`
        : category.id === 'top-ups' || category.id === 'gift-cards'
          ? `${quantity * 500} ₽`
          : category.id === 'currency'
            ? `${quantity * 1000} ед.`
            : `Вариант ${Math.floor(index / 24) + 1}`;
    const sellerNumber = Math.floor(next() * 900) + 100;
    return {
      id: `offer-${index + 1}`,
      categoryId: category.id,
      title: `${platform} · ${category.action}, ${variant}`,
      description: `${category.action} для ${platform}. ${variant}. Условия и детали выполнения уточняются у продавца до оформления заказа.`,
      platform,
      image: `assets/images/catalog-${category.id}.svg`,
      price,
      rating: Math.round((4.3 + next() * 0.7) * 10) / 10,
      reviewCount: 10 + Math.floor(next() * 2400),
      deliveryMinutes: [5, 15, 30, 60, 120][Math.floor(next() * 5)],
      publishedAt: Date.UTC(2026, 0, 1) + index * 3_600_000,
      sales: Math.floor(next() * 10000),
      seller: { name: `player_${sellerNumber.toString(36)}` },
    };
  }
}
