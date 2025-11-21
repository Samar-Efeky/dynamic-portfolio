import { Component, OnDestroy, ViewChild } from '@angular/core';
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';
import { InViewDirective } from "../../directives/in-view.directive";

@Component({
  selector: 'app-testimonial',
  standalone: true,
  imports: [CarouselModule, InViewDirective],
  templateUrl: './testimonial.html',
  styleUrls: ['./testimonial.scss'],
})
export class Testimonial implements OnDestroy{
 @ViewChild('owlCar') owlCar: any;
  testimonials = [
    {
      text: `Voluptas tempore rem. Molestiae incidunt consequatur quis ipsa autem nam sit enim magni.`,
      name: 'Andrew Carnegie',
      title: 'Carnegie Steel Co.',
      img: 'img/img3.png'
    },
    {
      text: `Explicabo a quaerat sint autem dolore ducimus. Nisi dolores quaerat rem nihil.`,
      name: 'Henry Ford',
      title: 'Ford Motor Co.',
      img: 'img/img3.png'
    },
    {
      text: `Molestiae incidunt consequatur quis ipsa autem nam sit enim magni.`,
      name: 'John Morgan',
      title: 'JP Morgan & Co.',
      img: 'img/img3.png'
    },
    {
      text: `Voluptas tempore rem. Molestiae incidunt consequatur quis ipsa autem nam sit enim magni.`,
      name: 'Andrew Carnegie',
      title: 'Carnegie Steel Co.',
      img: 'img/img3.png'
    },
    {
      text: `Explicabo a quaerat sint autem dolore ducimus. Nisi dolores quaerat rem nihil.`,
      name: 'Henry Ford',
      title: 'Ford Motor Co.',
      img: 'img/img3.png'
    },
    {
      text: `Molestiae incidunt consequatur quis ipsa autem nam sit enim magni.`,
      name: 'John Morgan',
      title: 'JP Morgan & Co.',
      img: 'img/img3.png'
    }
  ];

  carouselOptions: OwlOptions = {
    loop: true,
    dots: true,
    nav: false,
    margin: 20,
    autoplay: true,
    autoplayTimeout: 4000,
    autoplayHoverPause: true,
    dotsData: true, 
    responsive: {
      0: { items: 1 },
      600: { items: 2 },
      1024: { items: 3 }
    }
  };
  getDots(): string[] {
    return Array(3).fill('');
  }
   ngOnDestroy() {
    if (this.owlCar && this.owlCar.autoplayInterval) {
      clearInterval(this.owlCar.autoplayInterval); 
    }
  }
}
