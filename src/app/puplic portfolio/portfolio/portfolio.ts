import { Component } from '@angular/core';
import { HeroSection } from "../hero-section/hero-section";
import { SliderTitles } from "../slider-titles/slider-titles";
import { RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-portfolio',
  imports: [HeroSection, SliderTitles, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './portfolio.html',
  styleUrl: './portfolio.scss',
})
export class Portfolio {

}
