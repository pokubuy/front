import { Component, input } from '@angular/core';

@Component({
  selector: 'app-icon',
  templateUrl: './icon.component.html',
  styleUrl: './icon.component.scss',
  host: { 'aria-hidden': 'true' },
})
export class IconComponent {
  readonly name = input.required<string>();
}
