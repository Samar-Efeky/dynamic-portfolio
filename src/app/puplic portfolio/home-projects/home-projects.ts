import { Component } from '@angular/core';
import { RouterLink } from "@angular/router";
import { InViewDirective } from "../../directives/in-view.directive";

@Component({
  selector: 'app-home-projects',
  imports: [RouterLink, InViewDirective],
  templateUrl: './home-projects.html',
  styleUrl: './home-projects.scss',
})
export class HomeProjects {
   images = ['img/work-image1.png',
     'img/work-image2.png',
      'img/work-image3.png',
    ];
      scrollToTop() {
  window.scrollTo({
    top: 0
  });
}
}
