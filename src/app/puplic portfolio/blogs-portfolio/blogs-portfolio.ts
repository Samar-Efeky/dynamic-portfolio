import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { HomeData } from "../home-data/home-data";
import { FooterPortfolio } from "../footer-portfolio/footer-portfolio";

@Component({
  selector: 'app-blogs-portfolio',
  imports: [CommonModule, HomeData, FooterPortfolio],
  templateUrl: './blogs-portfolio.html',
  styleUrl: './blogs-portfolio.scss'
})
export class BlogsPortfolio {
    blogs = [
    {
      mainTitle: 'Productivity',
      title: 'Need Web Hosting for Your Websites?',
      desc: `Rerum quam quos. Aut asperiores sit mollitia. Rem neque et voluptatem eos quia sed
      eligendi et. Eaque velit eligendi ut magnam. Cumque ducimus laborum doloribus facere maxime
      vel earum quidem enim suscipit.`
    },
    {
      mainTitle: 'SEO',
      title: '5 Marketing Productivity Apps for Your Team',
      desc: `Quibusdam quis autem voluptatibus earum vel ex error ea magni. Rerum quam quos. Aut
      asperiores sit mollitia. Rem neque et voluptatem eos quia sed eligendi et.`
    },
    {
      mainTitle: 'Sponsored',
      title: '5 Effective Web Design Principles',
      desc: `Rerum quam quos. Quibusdam quis autem voluptatibus earum vel ex error ea magni. Aut
      asperiores sit mollitia. Rem neque et voluptatem eos quia sed eligendi et.`
    },
    {
      mainTitle: 'Productivity',
      title: 'Need Web Hosting for Your Websites?',
      desc: `Rerum quam quos. Aut asperiores sit mollitia. Rem neque et voluptatem eos quia sed
      eligendi et. Eaque velit eligendi ut magnam. Cumque ducimus laborum doloribus facere maxime
      vel earum quidem enim suscipit.`
    },
    {
      mainTitle: 'SEO',
      title: '5 Marketing Productivity Apps for Your Team',
      desc: `Quibusdam quis autem voluptatibus earum vel ex error ea magni. Rerum quam quos. Aut
      asperiores sit mollitia. Rem neque et voluptatem eos quia sed eligendi et.`
    },
    {
      mainTitle: 'Sponsored',
      title: '5 Effective Web Design Principles',
      desc: `Rerum quam quos. Quibusdam quis autem voluptatibus earum vel ex error ea magni. Aut
      asperiores sit mollitia. Rem neque et voluptatem eos quia sed eligendi et.`
    }
  ];
}
