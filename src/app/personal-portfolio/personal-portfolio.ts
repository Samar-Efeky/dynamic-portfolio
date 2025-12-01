import { Component, HostListener, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { PublicNavbar } from "../puplic portfolio/public-navbar/public-navbar";
import { RouterOutlet, ActivatedRoute } from '@angular/router';
import { FooterPortfolio } from "../puplic portfolio/footer-portfolio/footer-portfolio";
import { AdminInfoService } from '../services/admin-info.service';
import { UserStateService } from '../services/user-state.service';
import { LoadingService } from '../services/loading.service';
import { Loading } from "../loading/loading";
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-personal-portfolio',
  standalone: true,
  imports: [PublicNavbar, RouterOutlet, FooterPortfolio, Loading,CommonModule],
  templateUrl: './personal-portfolio.html',
  styleUrl: './personal-portfolio.scss',
})
export class PersonalPortfolio implements  OnInit{
private platformId = inject(PLATFORM_ID);
  username: string | null = null;
  uid: string | null = null;
  showScrollButton = false;
  isLoading = true; 

  constructor(
    private route: ActivatedRoute,
    private adminInfoService: AdminInfoService,
    private userState: UserStateService,
    private loadingService: LoadingService
  ) {}

  ngOnInit() {
    // متابعة حالة اللودينج
    this.loadingService.isLoading$.subscribe(status => {
      this.isLoading = status;
    });

    // جلب الداتا مع عرض اللودينج
    this.route.paramMap.subscribe(async params => {
      const username = params.get('username');
      if (!username) return;

      this.loadingService.show(); // اللودينج يبدأ فورًا عند الطلب

      this.username = username;
      this.userState.username.set(username);

      try {
        const adminData = await this.adminInfoService.getAdminInfoByUsername(username);
        this.uid = adminData?.uid ?? null;
        this.userState.uid.set(this.uid);
      } catch (err) {
        console.error('Error fetching admin data:', err);
      } finally {
        this.loadingService.hide(); 
      }
    });

    // Scroll listener
    if (isPlatformBrowser(this.platformId)) {
      window.addEventListener('scroll', this.onWindowScroll.bind(this));
    }
  }


  scrollToTop() {
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  onWindowScroll() {
     if (isPlatformBrowser(this.platformId)) {
this.showScrollButton = window.scrollY > 500;
     }
  }
}
