import { Component } from '@angular/core';
import { AdminNavbar } from "../admin-components/admin-navbar/admin-navbar";
import { RouterOutlet } from '@angular/router';
@Component({
  selector: 'app-admin-portfolio',
  imports: [AdminNavbar, RouterOutlet],
  templateUrl: './admin-portfolio.html',
  styleUrl: './admin-portfolio.scss',
})
export class AdminPortfolio {
 
}
