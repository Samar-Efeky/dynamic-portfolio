import { Directive, ElementRef, Renderer2, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { LoadingService } from '../services/loading.service';

// Create a shared IntersectionObserver instance to be reused across all directive instances
let sharedObserver: IntersectionObserver | null = null;

@Directive({
  selector: '[appInView]',
  standalone: true         
})
export class InViewDirective implements OnInit {

  constructor(
    private el: ElementRef,               
    private renderer: Renderer2,           
    @Inject(PLATFORM_ID) private platformId: Object ,
    private loadingService:LoadingService
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
               this.loadingService.isLoading$.subscribe(isLoading => {
                if (!isLoading) {
                  // Add 'show' class only after loading finished
                  (entry.target as HTMLElement).classList.add('show');
                  sharedObserver?.unobserve(entry.target);
                }
              });
            }
          });
        }, { threshold: 0.2 }); // 20% visibility threshold
      }

      // Start observing the current element
      sharedObserver.observe(this.el.nativeElement);
    }
  }
}
