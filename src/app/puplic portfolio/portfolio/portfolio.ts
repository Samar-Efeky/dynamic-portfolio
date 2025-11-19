import { Component } from '@angular/core';
import { HeroSection } from "../hero-section/hero-section";
import { SliderTitles } from "../slider-titles/slider-titles";

@Component({
  selector: 'app-portfolio',
  imports: [ HeroSection, SliderTitles],
  templateUrl: './portfolio.html',
  styleUrl: './portfolio.scss',
})
export class Portfolio {

}
