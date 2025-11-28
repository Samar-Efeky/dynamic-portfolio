import { CommonModule } from '@angular/common';
import { Component, effect, EffectRef } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Testimonial } from "../testimonial/testimonial";
import { HomeBlogs } from "../home-blogs/home-blogs";
import { InViewDirective } from "../../directives/in-view.directive";
import { UserStateService } from '../../services/user-state.service';
import { AdminProjectsService } from '../../services/admin-projects.service';
import { AdminInfoService } from '../../services/admin-info.service';

@Component({
  selector: 'app-work-portfolio',
  standalone: true,
  imports: [
    CommonModule,
    Testimonial,
    HomeBlogs,
    InViewDirective,
    RouterLink
  ],
  templateUrl: './projects-portfolio.html',
  styleUrl: './projects-portfolio.scss',
})
export class ProjectsPortfolio {
  projectsList: any = null;
  info: any = null;
  username: string = '';
  uid: any = null;

  private effectRef!: EffectRef;

  constructor(
    private userState: UserStateService,
    private adminProjectService: AdminProjectsService,
    private adminInfoService: AdminInfoService
  ) {
    this.initEffect();
  }

  initEffect() {
    this.effectRef = effect(() => {
      this.uid = this.userState.uid();
      if (!this.uid) return;
      this.loadData(this.uid);
    });
  }

  async loadData(uid: string) {
    this.projectsList = await this.adminProjectService.getProjects(uid);
    this.info = await this.adminInfoService.getAdminInfo(uid);
    this.username = this.info?.username ?? '';
  }

  scrollToTop() {
    window.scrollTo({ top: 0 });
  }

  ngOnDestroy() {
    // Destroy the effect safely
    if (this.effectRef) {
      this.effectRef.destroy();
    }

    // Clear stored data
    this.projectsList = null;
    this.info = null;
    this.username = '';
    this.uid = null;
  }
}
