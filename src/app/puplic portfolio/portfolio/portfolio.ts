import { Component, effect, EffectRef, OnDestroy, signal } from '@angular/core';
import { HeroSection } from "../hero-section/hero-section";
import { RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router';
import { HomeProjects } from "../home-projects/home-projects";
import { HomeServices } from "../home-services/home-services";
import { Testimonial } from "../testimonial/testimonial";
import { HomeBlogs } from "../home-blogs/home-blogs";
import { HomeData } from "../home-data/home-data";
import { AdminInfoService } from '../../services/admin-info.service';
import { AdminAboutService } from '../../services/admin-about.service';
import { UserStateService } from '../../services/user-state.service';
import { SliderTitles } from '../slider-titles/slider-titles';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../services/loading.service';
@Component({
  selector: 'app-portfolio',
  standalone: true,
  imports: [
    HeroSection, SliderTitles, RouterOutlet, RouterLink, RouterLinkActive,
    HomeProjects, HomeServices, Testimonial, HomeBlogs, HomeData, CommonModule
  ],
  templateUrl: './portfolio.html',
  styleUrl: './portfolio.scss',
})
export class Portfolio implements  OnDestroy{
   info: any = null;
  about: any = null;

  private effectRef!: EffectRef; 
  constructor(
    private userState: UserStateService,
    private adminInfoService: AdminInfoService,
    private adminAboutService: AdminAboutService,
    private loadingService: LoadingService
  ) {
    this.effectRef = effect(async () => {
      const uid = this.userState.uid();
      if (!uid) return;

      this.loadingService.show(); 
      try {
        const [info, about] = await Promise.all([
          this.adminInfoService.getAdminInfo(uid),
          this.adminAboutService.getAbout(uid)
        ]);
        this.info = info;
        this.about = about;
      } catch (err) {
        console.error('Error fetching portfolio data:', err);
      } finally {
        this.loadingService.hide(); 
      }
    });
  }

  ngOnDestroy() {
    if (this.effectRef) {
      this.effectRef.destroy();
    }
    this.info = null;
    this.about = null;
  }
}  