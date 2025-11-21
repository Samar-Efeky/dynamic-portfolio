import { Component } from '@angular/core';
import { HeroSection } from "../hero-section/hero-section";
import { SliderTitles } from "../slider-titles/slider-titles";
import { RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router';
import { HomeProjects } from "../home-projects/home-projects";
import { HomeServices } from "../home-services/home-services";
import { Testimonial } from "../testimonial/testimonial";
import { HomeBlogs } from "../home-blogs/home-blogs";
import { HomeData } from "../home-data/home-data";
@Component({
  selector: 'app-portfolio',
  imports: [HeroSection, SliderTitles, RouterOutlet, RouterLink, RouterLinkActive, HomeProjects, HomeServices, 
    Testimonial, HomeBlogs, HomeData],
  templateUrl: './portfolio.html',
  styleUrl: './portfolio.scss',
})
export class Portfolio {

}
