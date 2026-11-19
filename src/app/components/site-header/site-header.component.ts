import { Component, inject, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthSessionService } from '../../services/auth-session.service';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-site-header',
  imports: [IconComponent, RouterLink],
  templateUrl: './site-header.component.html',
  styleUrl: './site-header.component.scss',
})
export class SiteHeaderComponent {
  protected readonly session = inject(AuthSessionService);
  readonly search = input('');
  readonly favoriteCount = input(0);
  readonly favoritesActive = input(false);
  readonly searchChange = output<string>();
  readonly searchSubmit = output<void>();
  readonly favoritesToggle = output<void>();
  protected updateSearch(event: Event): void {
    this.searchChange.emit((event.target as HTMLInputElement).value);
  }
}
