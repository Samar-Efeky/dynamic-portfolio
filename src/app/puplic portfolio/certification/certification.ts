import { Component } from '@angular/core';
import { InViewDirective } from "../../directives/in-view.directive";

@Component({
  selector: 'app-certification',
  imports: [ InViewDirective],
  templateUrl: './certification.html',
  styleUrl: './certification.scss',
})
export class Certification {
   certificationImages = [
    'img/img3.png',
    'img/img3.png',
    'img/img3.png',
    'img/img3.png',
    'img/img3.png',
    'img/img3.png',
  ];
}
