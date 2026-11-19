import { Component } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { IconComponent } from '../../icon/icon.component';

@Component({
  selector: 'app-home-hero',
  imports: [IconComponent, NgOptimizedImage],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss',
})
export class HeroComponent {}
