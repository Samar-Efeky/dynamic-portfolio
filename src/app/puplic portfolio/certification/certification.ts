import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-certification',
  imports: [CommonModule],
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
