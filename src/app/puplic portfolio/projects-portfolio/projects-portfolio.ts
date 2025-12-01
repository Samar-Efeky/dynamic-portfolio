import { CommonModule } from '@angular/common';
import { Component, effect, EffectRef, inject, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Testimonial } from "../testimonial/testimonial";
import { HomeBlogs } from "../home-blogs/home-blogs";
import { InViewDirective } from "../../directives/in-view.directive";
import { UserStateService } from '../../services/user-state.service';
import { AdminProjectsService } from '../../services/admin-projects.service';
import { AdminInfoService } from '../../services/admin-info.service';
import { LoadingService } from '../../services/loading.service';

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
export class ProjectsPortfolio implements  OnDestroy{
  projectsList: any = null;
  info: any = null;
  username: string = '';
  uid: any = null;

  private effectRef!: EffectRef;

  private loadingService = inject(LoadingService);
  private userState = inject(UserStateService);
  private adminProjectService = inject(AdminProjectsService);
  private adminInfoService = inject(AdminInfoService);

  constructor() {
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
    this.loadingService.show(); 
    try {
      const [projects, info] = await Promise.all([
        this.adminProjectService.getProjects(uid),
        this.adminInfoService.getAdminInfo(uid)
      ]);
      this.projectsList = projects;
      this.info = info;
      this.username = info?.['username'] ?? '';
    } catch (err) {
      console.error('Error fetching ProjectsPortfolio data:', err);
    } finally {
      this.loadingService.hide(); 
    }
  }

  scrollToTop() {
    window.scrollTo({ top: 0 });
  }

  ngOnDestroy() {
    if (this.effectRef) {
      this.effectRef.destroy();
    }
    this.projectsList = null;
    this.info = null;
    this.username = '';
    this.uid = null;
  }
}
