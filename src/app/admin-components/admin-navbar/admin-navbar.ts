import { Component, AfterViewInit, ElementRef, ViewChild, HostListener, OnDestroy } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AdminDataCheckService } from '../../services/admin-data-check';
import { AuthService } from '../../services/auth';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-admin-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './admin-navbar.html',
  styleUrls: ['./admin-navbar.scss']
})
export class AdminNavbar implements AfterViewInit, OnDestroy {
  @ViewChild('navbar') navbar!: ElementRef;
  sidebarOpen = false;
  isFixed = false;
  navbarOffsetTop: number = 0;
  livePortfolioEnabled = false;

  private destroy$ = new Subject<void>();
  uid: string | null = null;

  constructor(
    private dataCheck: AdminDataCheckService,
    private auth: AuthService
  ) {}

  ngAfterViewInit() {
    this.navbarOffsetTop = this.navbar.nativeElement.offsetTop;

    this.auth.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        if (user) {
          this.uid = user.uid;
          this.dataCheck.checkAllData(this.uid); // تحقق بعد ما uid جاهز
        }
      });

    this.dataCheck.dataSaved$
      .pipe(takeUntil(this.destroy$))
      .subscribe(status => {
        this.livePortfolioEnabled = status;
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  openPortfolioInNewTab() {
    if (this.livePortfolioEnabled) {
      window.open('/portfolio', '_blank');
    }
  }

  onScrollTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isFixed = window.scrollY >= this.navbarOffsetTop;
  }
}
