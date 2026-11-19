import { Component, computed, ElementRef, inject, signal, viewChild } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';
import { CatalogService } from '../../services/catalog.service';
import { CatalogQuery, CatalogSort } from '../../models/catalog/catalog-query.model';
import { CatalogPage } from '../../models/catalog/catalog-page.model';
import { Offer } from '../../models/catalog/offer.model';
import { IconComponent } from '../icon/icon.component';
import { SiteHeaderComponent } from '../site-header/site-header.component';
import { OfferCardComponent } from '../offer-card/offer-card.component';
import { HeroComponent } from './hero/hero.component';
import { SellerBannerComponent } from './seller-banner/seller-banner.component';
import { SiteFooterComponent } from '../site-footer/site-footer.component';
import { OfferPreviewComponent } from '../offer-preview/offer-preview.component';
import { CategoriesComponent } from './categories/categories.component';

@Component({
  selector: 'app-home',
  imports: [
    SiteHeaderComponent,
    HeroComponent,
    IconComponent,
    OfferCardComponent,
    SellerBannerComponent,
    SiteFooterComponent,
    OfferPreviewComponent,
    CategoriesComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  private readonly catalog = inject(CatalogService);
  private readonly preview = viewChild(OfferPreviewComponent);
  private readonly catalogSection = viewChild<ElementRef<HTMLElement>>('catalogSection');
  protected readonly categories = toSignal(this.catalog.getCategories(), { initialValue: [] });
  protected readonly search = signal('');
  protected readonly categoryId = signal('');
  protected readonly sort = signal<CatalogSort>('popular');
  protected readonly favoriteIds = signal<readonly string[]>([]);
  protected readonly favoritesOnly = signal(false);
  protected readonly limit = signal(12);
  protected readonly selectedOffer = signal<Offer | null>(null);
  protected readonly query = computed<CatalogQuery>(() => ({
    search: this.search(),
    categoryId: this.categoryId(),
    sort: this.sort(),
    favoriteIds: this.favoritesOnly() ? this.favoriteIds() : undefined,
    limit: this.limit(),
  }));
  protected readonly page = toSignal(
    toObservable(this.query).pipe(switchMap((query) => this.catalog.getOffers(query))),
    { initialValue: { items: [], total: 0 } as CatalogPage },
  );
  protected readonly heading = computed(() =>
    this.favoritesOnly()
      ? 'Избранное'
      : this.search().trim()
        ? 'Результаты поиска'
        : (this.categories().find((category) => category.id === this.categoryId())?.name ??
          'Найди то самое'),
  );
  protected setSearch(value: string): void {
    this.search.set(value);
    this.limit.set(12);
  }
  protected showMore(): void {
    this.limit.update((value) => value + 12);
  }
  protected selectCategory(value: string): void {
    this.categoryId.set(value);
    this.limit.set(12);
    this.scrollToCatalog();
  }
  protected scrollToCatalog(): void {
    this.catalogSection()?.nativeElement.scrollIntoView({ block: 'start' });
  }
  protected changeSort(event: Event): void {
    this.sort.set((event.target as HTMLSelectElement).value as CatalogSort);
    this.limit.set(12);
  }
  protected toggleFavoritesView(): void {
    this.favoritesOnly.update((value) => !value);
    this.limit.set(12);
    this.scrollToCatalog();
  }
  protected toggleFavorite(id: string): void {
    this.favoriteIds.update((ids) =>
      ids.includes(id) ? ids.filter((value) => value !== id) : [...ids, id],
    );
  }
  protected resetCatalog(): void {
    this.search.set('');
    this.categoryId.set('');
    this.favoritesOnly.set(false);
    this.limit.set(12);
  }
  protected openOffer(offer: Offer): void {
    this.selectedOffer.set(offer);
    this.preview()?.open();
  }
}
