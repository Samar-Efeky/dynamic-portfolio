import { Component, HostListener, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from "@angular/router";
import { CommonModule, ViewportScroller } from '@angular/common';

@Component({
  selector: 'app-public-navbar',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './public-navbar.html',
  styleUrls: ['./public-navbar.scss'],  // <- it should be styleUrls, not styleUrl
})
export class PublicNavbar implements OnInit {
  sidebarOpen = false;
  scrolled = false;

  constructor(private router: Router) {}

  ngOnInit() {
    // Scroll to fragment if present
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const fragment = this.router.parseUrl(this.router.url).fragment;
        if (fragment) {
          document.getElementById(fragment)?.scrollIntoView({
            behavior: 'smooth'
          });
        }
      }
    });
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

  isLinkActive(url: string, fragment?: string): boolean {
  const tree = this.router.parseUrl(this.router.url);

  // تحقق من المسار
  const currentUrl = tree.root.children['primary']?.segments.map(it => it.path).join('/') || '';

  // تحقق من fragment إذا موجود
  if (fragment) {
    return currentUrl === url.replace('/', '') && tree.fragment === fragment;
  }

  // إذا الـ fragment غير موجود، نتأكد أنه مفيش fragment موجود عشان الـ Home ما يكونش نشط مع Testimonial
  return currentUrl === url.replace('/', '') && !tree.fragment;
}

}