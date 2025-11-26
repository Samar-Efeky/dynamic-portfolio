import { Component, HostListener, OnInit } from '@angular/core';
import { PublicNavbar } from "../puplic portfolio/public-navbar/public-navbar";
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { FooterPortfolio } from "../puplic portfolio/footer-portfolio/footer-portfolio";
import { AdminInfoService } from '../services/admin-info.service';
import { AdminAboutService } from '../services/admin-about.service';
@Component({
  selector: 'app-personal-portfolio',
  imports: [PublicNavbar, RouterOutlet, FooterPortfolio],
  templateUrl: './personal-portfolio.html',
  styleUrl: './personal-portfolio.scss',
})
export class PersonalPortfolio implements OnInit{
  username: string | null = null;
  uid: any = null;

  about: any = null;
    constructor(
    private route: ActivatedRoute,
    private adminInfoService: AdminInfoService,
    private adminAboutService: AdminAboutService
  ) {}
   async ngOnInit() {
    this.route.paramMap.subscribe(async (params) => {
      this.username = params.get('username');

      if (this.username) {
        // جلب بيانات UID بناءً على username
        const adminData = await this.adminInfoService.getAdminInfoByUsername(this.username);
        if (adminData && adminData['uid']) {
          this.uid = adminData['uid'];

          // جلب بيانات About
          this.about = await this.adminAboutService.getAbout(this.uid);
        }
      }
    });
  }
  scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}
  showScrollButton = false;

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    this.showScrollButton = scrollY > 500; 
  }
}
