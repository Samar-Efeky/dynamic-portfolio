import {
  Component,
  HostListener,
  OnDestroy,
  inject,
  effect,
  signal
} from '@angular/core';
import { Router, RouterLink,NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter, takeUntil, Subject } from 'rxjs';
import { AdminInfoService } from '../../services/admin-info.service';
import { UserStateService } from '../../services/user-state.service';
import { AdminTestimonialsService } from '../../services/admin-testimonials.service';
import { log } from 'console';

@Component({
  selector: 'app-public-navbar',
  standalone: true,
  imports: [RouterLink,  CommonModule],
templateUrl: './public-navbar.html',
  styleUrls: ['./public-navbar.scss']
})
export class PublicNavbar implements OnDestroy {
  uid = signal<string | null>(null);
  info = signal<any>(null);
  TestimonialContent:any='';
  sidebarOpen = false;
  scrolled = false;

  private destroy$ = new Subject<void>();

  private userState = inject(UserStateService);
  private infoService = inject(AdminInfoService);
  private testimService=inject(AdminTestimonialsService);
  private router = inject(Router);

  constructor() {
    // Effect reacts to UID changes automatically
    effect(async () => {
      const uid = this.userState.uid();
      this.uid.set(uid);

      if (uid) {
        const info = await this.infoService.getAdminInfo(uid);
        this.info.set(info);
        this.TestimonialContent=await this.testimService.getTestimonials(uid);
      }
    });

    // Scroll handling on route change
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(() => this.handleFragmentScroll());
  }

  private handleFragmentScroll() {
  const tree = this.router.parseUrl(this.router.url);
  const fragment = tree.fragment;
  if (!fragment) return;

  const checkAndScroll = () => {
    const el = document.getElementById(fragment);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      setTimeout(checkAndScroll, 100);
    }
  };

  checkAndScroll();
}


  isLinkActive(path: string, fragment?: string): boolean {
    const info = this.info();
    if (!info?.username) return false; // <-- prevent null errors

    const tree = this.router.parseUrl(this.router.url);
    const currentPath =
      '/' + (tree.root.children['primary']?.segments.map(s => s.path).join('/') ?? '');
    const home = `/portfolio/${info.username}`;

    if (fragment) return currentPath === home && tree.fragment === fragment;
    if (path === '.') return currentPath === home && !tree.fragment;

    return currentPath === `${home}/${path}`;
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  @HostListener('window:scroll')
  onScroll() {
    this.scrolled = window.scrollY > 200;
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
