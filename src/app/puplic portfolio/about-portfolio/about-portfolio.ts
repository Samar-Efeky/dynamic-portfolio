import { Component, OnDestroy, effect } from '@angular/core';
import { Testimonial } from "../testimonial/testimonial";
import { InViewDirective } from "../../directives/in-view.directive";
import { HomeServices } from "../home-services/home-services";
import { UserStateService } from '../../services/user-state.service';
import { AdminAboutService } from '../../services/admin-about.service';
import { AdminInfoService } from '../../services/admin-info.service';
import { SliderTitles } from "../slider-titles/slider-titles";
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-about-portfolio',
  imports: [Testimonial, InViewDirective, HomeServices, SliderTitles],
  templateUrl: './about-portfolio.html',
  styleUrl: './about-portfolio.scss',
})
export class AboutPortfolio implements OnDestroy {
  about: any = null;
  info: any = null;
  username: any = null;

  private destroy$ = new Subject<void>();

  constructor(
    private userState: UserStateService,
    private adminAboutService: AdminAboutService,
    private adminInfoService: AdminInfoService,
  ) {
    effect(() => {
      const uid = this.userState.uid();
      this.username = this.userState.username();
      if (!uid) return;

      this.loadData(uid);
    });
  }

  async loadData(uid: string) {
    const [about, info] = await Promise.all([
      this.adminAboutService.getAbout(uid),
      this.adminInfoService.getAdminInfo(uid)
    ]);
    this.about = about;
    this.info = info;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
