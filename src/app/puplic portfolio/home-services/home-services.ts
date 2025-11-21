import { Component } from '@angular/core';
import { RouterLink } from "@angular/router";
import { InViewDirective } from "../../directives/in-view.directive";

@Component({
  selector: 'app-home-services',
  imports: [RouterLink, InViewDirective],
  templateUrl: './home-services.html',
  styleUrl: './home-services.scss',
})
export class HomeServices {
    scrollToTop() {
  window.scrollTo({
    top: 0
  });
}
}
