import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AdminAboutService } from './admin-about.service';
import { AdminBlogsService } from './admin-blogs.service';
import { AdminExperienceService } from './admin-experience.service';
import { AdminInfoService } from './admin-info.service';
import { AdminProjectsService } from './admin-projects.service';
import { AdminServicesService } from './admin-services.service';
import { AdminTestimonialsService } from './admin-testimonials.service';

@Injectable({ providedIn: 'root' })
export class AdminDataCheckService {

  private about = inject(AdminAboutService);
  private blogs = inject(AdminBlogsService);
  private experience = inject(AdminExperienceService);
  private info = inject(AdminInfoService);
  private projects = inject(AdminProjectsService);
  private services = inject(AdminServicesService);
  private testimonials = inject(AdminTestimonialsService);

  private _dataSaved = new BehaviorSubject<boolean>(false);
  dataSaved$ = this._dataSaved.asObservable();

  constructor() {}

  async checkAllData(uid: string) {
      if (typeof window === 'undefined') return;
    try {

      const aboutData = await this.about.getAbout(uid);
      const blogsData = await this.blogs.getBlogs(uid);
      const expData = await this.experience.getExperience(uid);
      const infoData = await this.info.getAdminInfo(uid);
      const projectsData = await this.projects.getProjects(uid);
      const servicesData = await this.services.getServices(uid);
      // const testimonialData = await this.testimonials.getTestimonials(uid);

      const allResults = [
        aboutData,
        blogsData,
        expData,
        infoData,
        projectsData,
        servicesData,
        // testimonialData
      ];

      const allSaved = allResults.every(data => {
        if (!data) return false;
        for (let key of Object.keys(data)) {
          const value = data[key];
          if (Array.isArray(value) && value.length === 0) return false;
          if (value === null || value === undefined) return false;
        }
        return true;
      });

      this._dataSaved.next(allSaved);

    } catch {
      this._dataSaved.next(false);
    }
  }
}
