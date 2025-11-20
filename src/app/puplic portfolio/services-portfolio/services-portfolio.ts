import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Testimonial } from "../testimonial/testimonial";
import { FooterPortfolio } from "../footer-portfolio/footer-portfolio";

@Component({
  selector: 'app-services-portfolio',
  imports: [CommonModule, Testimonial, FooterPortfolio],
  templateUrl: './services-portfolio.html',
  styleUrl: './services-portfolio.scss',
})
export class ServicesPortfolio {
   services = [
    {
      number: '01.',
      title: 'Digital Marketing',
      desc: `Rerum quam quos. Aut asperiores sit mollitia. Rem neque et voluptatem eos quia sed
      eligendi et. Eaque velit eligendi ut magnam. Cumque ducimus laborum doloribus facere maxime
      vel earum quidem enim suscipit.`,
      list: ['Cumque Ducimus', 'Maxime Vel']
    },
    {
      number: '02.',
      title: 'Social Media Marketing',
      desc: `Quibusdam quis autem voluptatibus earum vel ex error ea magni. Rerum quam quos. Aut
      asperiores sit mollitia. Rem neque et voluptatem eos quia sed eligendi et.`,
      list: ['Lorem Ipsum', 'voluptatibus Earum']
    },
    {
      number: '03.',
      title: 'Content Marketing',
      desc: `Rerum quam quos. Quibusdam quis autem voluptatibus earum vel ex error ea magni. Aut
      asperiores sit mollitia. Rem neque et voluptatem eos quia sed eligendi et.`,
      list: ['Eaque velit', 'Asperiores']
    },
    {
      number: '04.',
      title: 'Digital Marketing',
      desc: `Rerum quam quos. Aut asperiores sit mollitia. Rem neque et voluptatem eos quia sed
      eligendi et. Eaque velit eligendi ut magnam. Cumque ducimus laborum doloribus facere maxime
      vel earum quidem enim suscipit.`,
      list: ['Cumque Ducimus', 'Maxime Vel']
    },
    {
      number: '05.',
      title: 'Social Media Marketing',
      desc: `Quibusdam quis autem voluptatibus earum vel ex error ea magni. Rerum quam quos. Aut
      asperiores sit mollitia. Rem neque et voluptatem eos quia sed eligendi et.`,
      list: ['Lorem Ipsum', 'voluptatibus Earum']
    },
    {
      number: '06.',
      title: 'Content Marketing',
      desc: `Rerum quam quos. Quibusdam quis autem voluptatibus earum vel ex error ea magni. Aut
      asperiores sit mollitia. Rem neque et voluptatem eos quia sed eligendi et.`,
      list: ['Eaque velit', 'Asperiores']
    }
  ];

}
