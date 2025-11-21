import { Component } from '@angular/core';

import { PersonalPortfolio } from "./personal-portfolio/personal-portfolio";
import { FooterPortfolio } from "./puplic portfolio/footer-portfolio/footer-portfolio";

@Component({
  selector: 'app-root',
  imports: [PersonalPortfolio, FooterPortfolio],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
}
