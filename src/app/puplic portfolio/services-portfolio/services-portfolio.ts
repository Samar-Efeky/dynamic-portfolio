import { CommonModule } from '@angular/common';
import { Component, effect, OnDestroy } from '@angular/core';
import { HomeData } from "../home-data/home-data";
import { InViewDirective } from "../../directives/in-view.directive";
import { UserStateService } from '../../services/user-state.service';
import { AdminAboutService } from '../../services/admin-about.service';
import { AdminServicesService } from '../../services/admin-services.service';
import { LoadingService } from '../../services/loading.service';
@Component({
  selector: 'app-services-portfolio',
  imports: [CommonModule, HomeData, InViewDirective],
  templateUrl: './services-portfolio.html',
  styleUrl: './services-portfolio.scss',
})
export class ServicesPortfolio implements  OnDestroy{
  about: any = null;
  data: any = null;
  private destroyed = false;
  private dataLoaded = false;
  private currentUid: string | null = null;

  constructor(
    private userState: UserStateService,
    private adminAboutService: AdminAboutService,
    private adminServices: AdminServicesService,
    private loadingService:LoadingService
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
    this.loadingService.show();
    try{
      const [about, data] = await Promise.all([
        this.adminAboutService.getAbout(uid),
        this.adminServices.getServices(uid)
      ]);
      this.about = about;
      this.data = data;
    } finally {
      this.loadingService.hide(); 
    }
  }

  scrollToTop() {
    window.scrollTo({ top: 0 });
  }

  ngOnDestroy() {
    this.destroyed = true;
  }

}
