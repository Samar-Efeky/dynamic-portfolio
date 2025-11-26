import { Component, AfterViewInit, ElementRef, ViewChild, HostListener, OnDestroy, NgZone } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AdminDataCheckService } from '../../services/admin-data-check';
import { AuthService } from '../../services/auth';
import { AdminInfoService } from '../../services/admin-info.service';
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

  uid: string | null = null;
  username: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private dataCheck: AdminDataCheckService,
    private auth: AuthService,
    private adminInfoService: AdminInfoService,
    private zone: NgZone
  ) {}

  ngAfterViewInit() {
    this.navbarOffsetTop = this.navbar.nativeElement.offsetTop;

    // جلب UID و username
    this.auth.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(async user => {
        if (user) {
          this.uid = user.uid;
          this.dataCheck.checkAllData(this.uid);

          const adminData = await this.adminInfoService.getAdminInfo(this.uid);
          if (adminData) {
            this.username = adminData['username'];
          }
        }
      });

    // تحديث حالة livePortfolioEnabled
    this.dataCheck.dataSaved$
      .pipe(takeUntil(this.destroy$))
      .subscribe(status => {
        this.zone.runOutsideAngular(() => {
          setTimeout(() => {
            this.livePortfolioEnabled = status;
          }, 0);
        });
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
  if (this.livePortfolioEnabled && this.username) {
    const url = `/portfolio/${encodeURIComponent(this.username)}`;
    window.open(url, '_blank');
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
