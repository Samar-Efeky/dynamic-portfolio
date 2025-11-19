import { Component } from '@angular/core';
import { PublicNavbar } from "../puplic portfolio/public-navbar/public-navbar";
import { RouterOutlet } from '@angular/router';
@Component({
  selector: 'app-personal-portfolio',
  imports: [PublicNavbar, RouterOutlet],
  templateUrl: './personal-portfolio.html',
  styleUrl: './personal-portfolio.scss',
})
export class PersonalPortfolio {

}
