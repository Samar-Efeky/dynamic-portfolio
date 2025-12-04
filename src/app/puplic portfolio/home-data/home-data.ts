import { Component, effect, OnDestroy } from '@angular/core';
import { UserStateService } from '../../services/user-state.service';
import { AdminInfoService } from '../../services/admin-info.service';
import { AdminAboutService } from '../../services/admin-about.service';

@Component({
  selector: 'app-home-data',
  imports: [],
  templateUrl: './home-data.html',
  styleUrl: './home-data.scss'
})
export class HomeData implements OnDestroy {
  info: any = null;
  about:any=null;
  private destroyed = false;
  private dataLoaded = false;
  private currentUid: string | null = null;

  constructor(
    private userState: UserStateService,
    private adminInfoService: AdminInfoService,
    private adminAboutService:AdminAboutService
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
    this.about=await this.adminAboutService.getAbout(uid);
  }

  ngOnDestroy() {
    this.destroyed = true;
    this.info = null; 
  }
}
