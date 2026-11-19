export interface Offer {
  readonly id: string;
  readonly categoryId: string;
  readonly title: string;
  readonly description: string;
  readonly platform: string;
  readonly image: string;
  readonly price: number;
  readonly rating: number;
  readonly reviewCount: number;
  readonly deliveryMinutes: number;
  readonly publishedAt: number;
  readonly sales: number;
  readonly seller: {
    readonly name: string;
  };
}
