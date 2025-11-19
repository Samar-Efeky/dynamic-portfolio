import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive } from "@angular/router";

@Component({
  selector: 'app-public-navbar',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './public-navbar.html',
  styleUrl: './public-navbar.scss',
})
export class PublicNavbar {
   sidebarOpen = false;
  scrolled = false;
  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }
    @HostListener('window:scroll', [])
  onWindowScroll() {
    this.scrolled = window.scrollY > 200; 
  }
}
