import { ViewportScroller } from '@angular/common';
import { Component } from '@angular/core';
import { InViewDirective } from "../../directives/in-view.directive";

@Component({
  selector: 'app-hero-section',
  imports: [InViewDirective],
  templateUrl: './hero-section.html',
  styleUrl: './hero-section.scss',
})
export class HeroSection {
  constructor(private viewportScroller:ViewportScroller){}
   public onClick(elementId: string): void {
    this.viewportScroller.scrollToAnchor(elementId);
  }
}
