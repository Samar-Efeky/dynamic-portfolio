import { Directive, ElementRef, Renderer2, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

// Create a shared IntersectionObserver instance to be reused across all directive instances
let sharedObserver: IntersectionObserver | null = null;

@Directive({
  selector: '[appInView]',
  standalone: true         
})
export class InViewDirective implements OnInit {

  constructor(
    private el: ElementRef,                 // Access to the DOM element this directive is applied to
    private renderer: Renderer2,            // Safe way to manipulate the DOM
    @Inject(PLATFORM_ID) private platformId: Object // Detects if the code is running in browser or server (for SSR)
  ) {}

  ngOnInit(): void {
    // Ensure the observer runs only in the browser (not on the server)
    if (isPlatformBrowser(this.platformId)) {

      // Initialize the shared observer only once
      if (!sharedObserver) {
        sharedObserver = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            // When the element enters the viewport (20% visible)
            if (entry.isIntersecting) {
              // Add the 'show' class to trigger animations or transitions
              (entry.target as HTMLElement).classList.add('show');
              // Stop observing this element after it becomes visible
              sharedObserver?.unobserve(entry.target);
            }
          });
        }, { threshold: 0.2 }); // 20% visibility threshold
      }

      // Start observing the current element
      sharedObserver.observe(this.el.nativeElement);
    }
  }
}
