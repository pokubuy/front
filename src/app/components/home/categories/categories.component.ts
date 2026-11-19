import { Component, input, output } from '@angular/core';
import { Category } from '../../../models/catalog/category.model';
import { IconComponent } from '../../icon/icon.component';

@Component({
  selector: 'app-home-categories',
  imports: [IconComponent],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss',
})
export class CategoriesComponent {
  readonly categories = input.required<readonly Category[]>();
  readonly categoryId = input('');
  readonly categoryChange = output<string>();
}
