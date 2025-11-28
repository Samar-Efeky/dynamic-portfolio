import { CommonModule } from '@angular/common';
import { Component, effect } from '@angular/core';
import { HomeData } from "../home-data/home-data";
import { InViewDirective } from "../../directives/in-view.directive";
import { UserStateService } from '../../services/user-state.service';
import { AdminAboutService } from '../../services/admin-about.service';
import { AdminServicesService } from '../../services/admin-services.service';

@Component({
  selector: 'app-services-portfolio',
  imports: [CommonModule, HomeData, InViewDirective],
  templateUrl: './services-portfolio.html',
  styleUrl: './services-portfolio.scss',
})
export class ServicesPortfolio {
  about: any = null;
  data: any = null;
  private destroyed = false;
  private dataLoaded = false;
  private currentUid: string | null = null;

  constructor(
    private userState: UserStateService,
    private adminAboutService: AdminAboutService,
    private adminServices: AdminServicesService
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
    this.about = await this.adminAboutService.getAbout(uid);
    this.data = await this.adminServices.getServices(uid);
  }

  scrollToTop() {
    window.scrollTo({ top: 0 });
  }

  ngOnDestroy() {
    this.destroyed = true;
  }

}
