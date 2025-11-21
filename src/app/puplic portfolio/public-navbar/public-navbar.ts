import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from "@angular/router";
import { CommonModule} from '@angular/common';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-public-navbar',
  imports: [ RouterLink, RouterLinkActive],
  templateUrl: './public-navbar.html',
  styleUrl: './public-navbar.scss',  // <- it should be styleUrls, not styleUrl
})
export class PublicNavbar implements OnInit, OnDestroy {

  // Controls sidebar open/close state
  sidebarOpen = false;

  // True when the user scrolls down (used for navbar background change)
  scrolled = false;

  // Subject used to clean up all subscriptions (prevents memory leaks)
  private destroy$ = new Subject<void>();

  constructor(private router: Router) {}

  ngOnInit() {
    // Subscribe to router navigation events
    // takeUntil(destroy$) automatically unsubscribes when component is destroyed
    this.router.events
      .pipe(takeUntil(this.destroy$))
      .subscribe(event => {
        // Check if navigation completed
        if (event instanceof NavigationEnd) {
          // Parse the current URL to get the fragment (#section)
          const urlTree = this.router.parseUrl(this.router.url);
          const fragment = urlTree.fragment;

          // If there is a fragment, scroll to its element
          if (fragment) {
            // Wait for the page to fully render before scrolling
            setTimeout(() => {
              const el = document.getElementById(fragment);
              if (el) {
                el.scrollIntoView({
                  behavior: 'smooth',
                  block: 'start'
                });
              }
            }, 300); // Delay to ensure Home component content is rendered
          }
        }
      });
  }

  ngOnDestroy() {
    // Emit destroy signal to unsubscribe from all observables
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Toggles sidebar visibility (mobile menu)
  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  // Detects page scrolling and updates "scrolled" state
  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.scrolled = window.scrollY > 200;
  }

  // Scroll the page smoothly to the top
  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Custom active link checker for fragment routes (Testimonial)
  isLinkActive(url: string, fragment?: string): boolean {
    const tree = this.router.parseUrl(this.router.url);

    // Get the current route path
    const currentUrl = tree.root.children['primary']?.segments
      .map(it => it.path)
      .join('/') || '';

    // If checking for a fragment link (like Testimonial)
    if (fragment) {
      return currentUrl === url.replace('/', '') && tree.fragment === fragment;
    }

    // If checking Home, ensure there is NO fragment
    return currentUrl === url.replace('/', '') && !tree.fragment;
  }
}
