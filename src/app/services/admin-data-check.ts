import { Injectable } from '@angular/core';
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
  private _dataSaved = new BehaviorSubject<boolean>(false);
  dataSaved$ = this._dataSaved.asObservable();

  constructor(
    private about: AdminAboutService,
    private blogs: AdminBlogsService,
    private experience: AdminExperienceService,
    private info: AdminInfoService,
    private projects: AdminProjectsService,
    private services: AdminServicesService,
    private testimonials: AdminTestimonialsService
  ) {}

  // تحقق شامل من كل البيانات
  async checkAllData(uid: string) {
    const results = await Promise.all([
      this.about.getAbout(uid),
      this.blogs.getBlogs(uid),
      this.experience.getExperience(uid),
      this.info.getAdminInfo(uid),
      this.projects.getProjects(uid),
      this.services.getServices(uid),
      this.testimonials.getTestimonials(uid),
    ]);

    const allSaved = results.every(data => {
      if (!data) return false; // null أو undefined
      for (let key of Object.keys(data)) {
        const value = data[key];
        if (Array.isArray(value) && value.length === 0) return false;
        if (value === null || value === undefined) return false;
      }
      return true;
    });

    this._dataSaved.next(allSaved);
  }
}
