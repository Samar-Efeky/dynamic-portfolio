import { Component, effect, OnDestroy } from '@angular/core';
import { RouterLink } from "@angular/router";
import { InViewDirective } from "../../directives/in-view.directive";
import { UserStateService } from '../../services/user-state.service';
import { AdminServicesService } from '../../services/admin-services.service';
import { AdminAboutService } from '../../services/admin-about.service';

@Component({
  selector: 'app-home-services',
  imports: [RouterLink, InViewDirective],
  templateUrl: './home-services.html',
  styleUrl: './home-services.scss',
})
export class HomeServices implements OnDestroy {
  username:any=null;
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
      this.username=userState.username();
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
