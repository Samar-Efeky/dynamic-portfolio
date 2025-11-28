import { CommonModule } from '@angular/common';
import { Component, effect } from '@angular/core';
import { HomeData } from "../home-data/home-data";
import { InViewDirective } from "../../directives/in-view.directive";
import { UserStateService } from '../../services/user-state.service';
import { AdminBlogsService } from '../../services/admin-blogs.service';

@Component({
  selector: 'app-blogs-portfolio',
  imports: [CommonModule, HomeData,InViewDirective],
  templateUrl: './blogs-portfolio.html',
  styleUrl: './blogs-portfolio.scss'
})
export class BlogsPortfolio {
   data: any = null;
  private destroyed = false;
  private dataLoaded = false;
  private currentUid: string | null = null;

  constructor(
    private userState: UserStateService,
    private adminBlogsService: AdminBlogsService,
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
    this.data = await this.adminBlogsService.getBlogs(uid);
  }

  scrollToTop() {
    window.scrollTo({ top: 0 });
  }

  ngOnDestroy() {
    this.destroyed = true;
    this.data = null;
  }
}
