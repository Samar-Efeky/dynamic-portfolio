import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, HostListener, ViewChild} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
@Component({
  selector: 'app-admin-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './admin-navbar.html',
  styleUrl: './admin-navbar.scss'
})
export class AdminNavbar implements AfterViewInit{
    @ViewChild('navbar') navbar!: ElementRef;
  sidebarOpen = false;
   isFixed = false;
  navbarOffsetTop: number = 0;

  ngAfterViewInit() {
    this.navbarOffsetTop = this.navbar.nativeElement.offsetTop;
  }

   toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }
 openPortfolioInNewTab() {
  window.open('/portfolio', '_blank');

}
onScrollTop(){
   window.scrollTo({ top: 0, behavior: 'smooth' });
}
@HostListener('window:scroll', [])
  onWindowScroll() {
    if (window.scrollY >= this.navbarOffsetTop) {
      this.isFixed = true;
    } else {
      this.isFixed = false;
    }
  }
}
