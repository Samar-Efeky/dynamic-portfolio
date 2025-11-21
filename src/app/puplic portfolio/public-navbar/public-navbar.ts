import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from "@angular/router";
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-public-navbar',
  imports: [ RouterLink, RouterLinkActive ],
  templateUrl: './public-navbar.html',
  styleUrl: './public-navbar.scss',
})
export class PublicNavbar implements OnInit, OnDestroy {

  sidebarOpen = false;
  scrolled = false;

  private destroy$ = new Subject<void>();

  constructor(private router: Router) {}

  ngOnInit() {
    this.router.events
      .pipe(takeUntil(this.destroy$))
      .subscribe(event => {
        if (event instanceof NavigationEnd) {
          const urlTree = this.router.parseUrl(this.router.url);
          const fragment = urlTree.fragment;

          if (fragment) {
            setTimeout(() => {
              const el = document.getElementById(fragment);
              if (el) {
                el.scrollIntoView({
                  behavior: 'smooth',
                  block: 'start'
                });
              }
            }, 300);
          }
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.scrolled = window.scrollY > 200;
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  isLinkActive(path: string, fragment?: string): boolean {
  const tree = this.router.parseUrl(this.router.url);
  const currentPath = '/' + tree.root.children['primary']?.segments.map(s => s.path).join('/');
  if (fragment) {
    return currentPath === path && tree.fragment === fragment;
  }
  return currentPath === path && !tree.fragment;
}

}
