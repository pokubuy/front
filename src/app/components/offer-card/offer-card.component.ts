import { Component, input, output } from '@angular/core';
import { CurrencyPipe, DecimalPipe, NgOptimizedImage } from '@angular/common';
import { Offer } from '../../models/catalog/offer.model';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-offer-card',
  imports: [IconComponent, CurrencyPipe, DecimalPipe, NgOptimizedImage],
  templateUrl: './offer-card.component.html',
  styleUrl: './offer-card.component.scss',
})
export class OfferCardComponent {
  readonly offer = input.required<Offer>();
  readonly favorite = input(false);
  readonly priority = input(false);
  readonly favoriteToggle = output<string>();
  readonly openOffer = output<Offer>();
}
