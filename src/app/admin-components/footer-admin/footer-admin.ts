import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-footer-admin',
  imports: [CommonModule],
  templateUrl: './footer-admin.html',
  styleUrl: './footer-admin.scss',
})
export class FooterAdmin {
  currentYear: number = new Date().getFullYear();
}
