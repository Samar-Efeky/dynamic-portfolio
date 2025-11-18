import { Component } from '@angular/core';
import { Router, RouterLink } from "@angular/router";

@Component({
  selector: 'app-admin-portfolio',
  imports: [],
  templateUrl: './admin-portfolio.html',
  styleUrl: './admin-portfolio.scss',
})
export class AdminPortfolio {
  constructor(private router:Router){}
   goToPortfolio(username:string) {
    this.router.navigate(['/portfolio', username]);
  }
}
