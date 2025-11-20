import { Component } from '@angular/core';
import { Testimonial } from "../testimonial/testimonial";
import { FooterPortfolio } from "../footer-portfolio/footer-portfolio";
@Component({
  selector: 'app-about-portfolio',
  imports: [Testimonial, FooterPortfolio],
  templateUrl: './about-portfolio.html',
  styleUrl: './about-portfolio.scss',
})
export class AboutPortfolio {

}
