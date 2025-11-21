import { Component, HostListener } from '@angular/core';
import { PublicNavbar } from "../puplic portfolio/public-navbar/public-navbar";
import { RouterOutlet } from '@angular/router';
@Component({
  selector: 'app-personal-portfolio',
  imports: [PublicNavbar, RouterOutlet],
  templateUrl: './personal-portfolio.html',
  styleUrl: './personal-portfolio.scss',
})
export class PersonalPortfolio {
  scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}
  showScrollButton = false;

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    this.showScrollButton = scrollY > 500; 
  }
}
