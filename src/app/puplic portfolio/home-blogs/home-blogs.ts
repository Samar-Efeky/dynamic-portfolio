import { CommonModule } from '@angular/common';
import { Component, effect, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { InViewDirective } from "../../directives/in-view.directive";
import { AdminBlogsService } from '../../services/admin-blogs.service';
import { UserStateService } from '../../services/user-state.service';

@Component({
  selector: 'app-home-blogs',
  imports: [CommonModule, RouterLink, InViewDirective],
  templateUrl: './home-blogs.html',
  styleUrl: './home-blogs.scss'
})
export class HomeBlogs implements OnDestroy {
username:any=null;
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
      this.username=userState.username();
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
