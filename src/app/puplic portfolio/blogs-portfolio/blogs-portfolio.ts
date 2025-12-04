import { CommonModule } from '@angular/common';
import { Component, effect, OnDestroy } from '@angular/core';
import { HomeData } from "../home-data/home-data";
import { InViewDirective } from "../../directives/in-view.directive";
import { UserStateService } from '../../services/user-state.service';
import { AdminBlogsService } from '../../services/admin-blogs.service';
import { LoadingService } from '../../services/loading.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-blogs-portfolio',
  imports: [CommonModule, HomeData,InViewDirective,RouterLink],
  templateUrl: './blogs-portfolio.html',
  styleUrl: './blogs-portfolio.scss'
})
export class BlogsPortfolio implements OnDestroy{
   data: any = null;
  private destroyed = false;
  private dataLoaded = false;
  private currentUid: string | null = null;
  uid:any='';
  username:any='';

  constructor(
    private userState: UserStateService,
    private adminBlogsService: AdminBlogsService,
    private loadingService:LoadingService
  ) {

    effect(() => {
      if (this.destroyed) return;

      this.uid = this.userState.uid();
      this.username=userState.username();
      if (!this.uid) return;
      if (this.dataLoaded && this.currentUid === this.uid) return;

      this.currentUid = this.uid;
      this.dataLoaded = true;
      this.loadData(this.uid);
    });
  }

  async loadData(uid: string) {
     this.loadingService.show();
     try{
      this.data= await this.adminBlogsService.getBlogs(uid);
     }finally{
      this.loadingService.hide();
     }
  }

  scrollToTop() {
    window.scrollTo({ top: 0 });
  }

  ngOnDestroy() {
    this.destroyed = true;
    this.data = null;
  }
}
