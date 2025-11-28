import { Component, effect, OnDestroy } from '@angular/core';
import { RouterLink } from "@angular/router";
import { AdminInfoService } from '../../services/admin-info.service';
import { UserStateService } from '../../services/user-state.service';
import { AdminAboutService } from '../../services/admin-about.service';

@Component({
  selector: 'app-footer-portfolio',
  imports: [RouterLink],
  templateUrl: './footer-portfolio.html',
  styleUrl: './footer-portfolio.scss'
})
export class FooterPortfolio implements OnDestroy {
  info: any = null;
  about: any = null;

  private destroyed = false;
  private dataLoaded = false;
  private currentUid: string | null = null;

  constructor(
    private userState: UserStateService,
    private adminInfoService: AdminInfoService,
    private adminAboutService: AdminAboutService
  ) {
    effect(() => {
      if (this.destroyed) return;

      const uid = this.userState.uid();
      if (!uid) return;
      if (this.dataLoaded && this.currentUid === uid) return;

      this.currentUid = uid;
      this.dataLoaded = true;
      this.loadData(uid);
    });
  }

  async loadData(uid: string) {
    this.info = await this.adminInfoService.getAdminInfo(uid);
    this.about = await this.adminAboutService.getAbout(uid);
  }

  scrollToTop() {
    window.scrollTo({ top: 0 });
  }

  ngOnDestroy() {
    this.destroyed = true;
    this.info = null;
    this.about = null; 
  }
}
