import { Component } from '@angular/core';
import { Testimonial } from "../testimonial/testimonial";
import { InViewDirective } from "../../directives/in-view.directive";
import { HomeServices } from "../home-services/home-services";
@Component({
  selector: 'app-about-portfolio',
  imports: [Testimonial, InViewDirective, HomeServices],
  templateUrl: './about-portfolio.html',
  styleUrl: './about-portfolio.scss',
})
export class AboutPortfolio {

}
