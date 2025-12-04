import { Component, OnDestroy, effect, inject } from '@angular/core';
import { Testimonial } from "../testimonial/testimonial";
import { InViewDirective } from "../../directives/in-view.directive";
import { HomeServices } from "../home-services/home-services";
import { UserStateService } from '../../services/user-state.service';
import { AdminAboutService } from '../../services/admin-about.service';
import { AdminInfoService } from '../../services/admin-info.service';
import { Subject } from 'rxjs';
import { LoadingService } from '../../services/loading.service';
@Component({
  selector: 'app-about-portfolio',
  imports: [Testimonial, InViewDirective, HomeServices],
  templateUrl: './about-portfolio.html',
  styleUrl: './about-portfolio.scss',
})
export class AboutPortfolio implements OnDestroy {
  about: any = null;
  info: any = null;
  username: any = null;

  private destroy$ = new Subject<void>();
  private loadingService = inject(LoadingService);
  private userState = inject(UserStateService);
  private adminAboutService = inject(AdminAboutService);
  private adminInfoService = inject(AdminInfoService);

  constructor() {
    effect(() => {
      const uid = this.userState.uid();
      this.username = this.userState.username();
      if (!uid) return;

      this.loadData(uid);
    });
  }

  async loadData(uid: string) {
    this.loadingService.show(); 
    try {
      const [about, info] = await Promise.all([
        this.adminAboutService.getAbout(uid),
        this.adminInfoService.getAdminInfo(uid)
      ]);
      this.about = about;
      this.info = info;
    } catch (err) {
      console.error('Error fetching AboutPortfolio data:', err);
    } finally {
      this.loadingService.hide(); 
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
