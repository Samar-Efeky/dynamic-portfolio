import { Component, effect, DestroyRef } from '@angular/core';
import { InViewDirective } from "../../directives/in-view.directive";
import { AdminExperienceService } from '../../services/admin-experience.service';
import { UserStateService } from '../../services/user-state.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-certification',
  imports: [InViewDirective, CommonModule],
  templateUrl: './certification.html',
  styleUrl: './certification.scss',
})
export class Certification {

  info: any = null;
  certifications: any[] = [];
  lightboxOpen = false;
  currentIndex = 0;

  constructor(
    private userState: UserStateService,
    private adminExperience: AdminExperienceService,
    private destroyRef: DestroyRef
  ) {

    const effectRef = effect(() => {
      const uid = this.userState.uid();
      if (!uid) return;

      this.loadData(uid);
    });

    // Cleanup to prevent memory leak
    this.destroyRef.onDestroy(() => {
      effectRef.destroy();
    });
  }

  async loadData(uid: string) {
    this.info = await this.adminExperience.getExperience(uid);
    this.certifications = this.info.certifications;
  }

  openLightbox(index: number) {
    this.currentIndex = index;
    this.lightboxOpen = true;
  }

  closeLightbox() {
    this.lightboxOpen = false;
  }

  prevImage() {
    this.currentIndex = 
      (this.currentIndex - 1 + this.certifications.length) % this.certifications.length;
  }

  nextImage() {
    this.currentIndex = 
      (this.currentIndex + 1) % this.certifications.length;
  }
}
