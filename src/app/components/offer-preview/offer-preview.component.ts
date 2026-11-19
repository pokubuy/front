import { Component, ElementRef, input, output, viewChild } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { Offer } from '../../models/catalog/offer.model';
import { IconComponent } from '../icon/icon.component';
@Component({
  selector: 'app-offer-preview',
  imports: [IconComponent, CurrencyPipe, DecimalPipe],
  templateUrl: './offer-preview.component.html',
  styleUrl: './offer-preview.component.scss',
})
export class OfferPreviewComponent {
  readonly offer = input<Offer | null>(null);
  readonly favorite = input(false);
  readonly favoriteToggle = output<string>();
  private readonly dialog = viewChild<ElementRef<HTMLDialogElement>>('offerDialog');
  open(): void {
    this.dialog()?.nativeElement.showModal();
  }
  protected close(): void {
    this.dialog()?.nativeElement.close();
  }
}
