import { Component } from '@angular/core';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-footer-portfolio',
  imports: [RouterLink],
  templateUrl: './footer-portfolio.html',
  styleUrl: './footer-portfolio.scss'
})
export class FooterPortfolio {
  scrollToTop() {
    window.scrollTo({ top: 0});
  }
}
