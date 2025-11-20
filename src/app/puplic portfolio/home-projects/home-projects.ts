import { Component } from '@angular/core';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-home-projects',
  imports: [RouterLink],
  templateUrl: './home-projects.html',
  styleUrl: './home-projects.scss',
})
export class HomeProjects {
   images = ['img/work-image1.png',
     'img/work-image2.png',
      'img/work-image3.png',
    ];
}
