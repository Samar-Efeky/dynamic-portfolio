import { Component } from '@angular/core';
import { Testimonial } from "../testimonial/testimonial";
import { HomeServices } from "../home-services/home-services";
import { HomeData } from "../home-data/home-data";
import { InViewDirective } from "../../directives/in-view.directive";

@Component({
  selector: 'app-contact-portfolio',
  imports: [ Testimonial, HomeServices, HomeData, InViewDirective],
  templateUrl: './contact-portfolio.html',
  styleUrl: './contact-portfolio.scss',
})
export class ContactPortfolio {

}
