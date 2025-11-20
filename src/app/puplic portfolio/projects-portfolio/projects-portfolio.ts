import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Testimonial } from "../testimonial/testimonial";
import { FooterPortfolio } from "../footer-portfolio/footer-portfolio";

@Component({
  selector: 'app-work-portfolio',
  imports: [CommonModule, Testimonial, FooterPortfolio],
  templateUrl: './projects-portfolio.html',
  styleUrl: './projects-portfolio.scss',
})
export class ProjectsPortfolio {
  images = ['img/work-image1.png',
     'img/work-image2.png',
      'img/work-image3.png',
      'img/work-image4.png', 
      'img/work-image5.png', 
      'img/work-image6.png',
    ];

}
