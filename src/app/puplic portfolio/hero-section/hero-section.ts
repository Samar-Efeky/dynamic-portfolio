import { ViewportScroller } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-hero-section',
  imports: [],
  templateUrl: './hero-section.html',
  styleUrl: './hero-section.scss',
})
export class HeroSection {
  constructor(private viewportScroller:ViewportScroller){}
   public onClick(elementId: string): void {
    this.viewportScroller.scrollToAnchor(elementId);
  }
}
