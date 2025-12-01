import { Component, effect, OnDestroy } from '@angular/core';
import { Testimonial } from "../testimonial/testimonial";
import { HomeServices } from "../home-services/home-services";
import { HomeData } from "../home-data/home-data";
import { InViewDirective } from "../../directives/in-view.directive";
import { UserStateService } from '../../services/user-state.service';
import { AdminInfoService } from '../../services/admin-info.service';
import { AdminAboutService } from '../../services/admin-about.service';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { LoadingService } from '../../services/loading.service';

@Component({
  selector: 'app-contact-portfolio',
  imports: [ Testimonial, HomeServices, HomeData, InViewDirective, CommonModule ],
  templateUrl: './contact-portfolio.html',
  styleUrl: './contact-portfolio.scss',
})
export class ContactPortfolio implements OnDestroy {
  info: any = null;
  about: any = null;

  private destroy$ = new Subject<void>();

  constructor(
    private userState: UserStateService,
    private adminInfoService: AdminInfoService,
    private adminAboutService: AdminAboutService,
    private loadingService:LoadingService
  ) {
    effect(() => {
      const uid = this.userState.uid();
      if (!uid) return;

      this.loadData(uid);
    });
  }

  async loadData(uid: string) {
    this.loadingService.show(); 
    try {
      const [info, about] = await Promise.all([
        this.adminInfoService.getAdminInfo(uid),
        this.adminAboutService.getAbout(uid)
      ]);
      this.info = info;
      this.about = about;
    } catch (err) {
      console.error('Error fetching ContactPortfolio data:', err);
    } finally {
      this.loadingService.hide(); 
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.info = null;
    this.about = null;
  }
}
