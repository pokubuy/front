import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../icon/icon.component';

@Component({
  selector: 'app-auth-header',
  imports: [RouterLink, IconComponent],
  templateUrl: './auth-header.component.html',
  styleUrl: './auth-header.component.scss',
})
export class AuthHeaderComponent {}
