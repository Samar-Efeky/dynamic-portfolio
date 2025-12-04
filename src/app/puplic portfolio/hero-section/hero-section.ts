import { Component, OnDestroy, effect } from '@angular/core';
import { CommonModule, ViewportScroller } from '@angular/common';
import { AdminInfoService } from '../../services/admin-info.service';
import { UserStateService } from '../../services/user-state.service';
import { Subject } from 'rxjs';
import { RouterLink } from "@angular/router";
import { InViewDirective } from '../../directives/in-view.directive';

@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [CommonModule, RouterLink, InViewDirective],
  templateUrl: './hero-section.html',
  styleUrls: ['./hero-section.scss'],
})
export class HeroSection implements OnDestroy {

  // ========================
  // PROPERTIES
  // ========================
  info: any = null;                    
  about: any = null;                   
  showVideoLightbox = false;           

  private destroy$ = new Subject<void>();  

  // ========================
  // CONSTRUCTOR
  // ========================
  constructor(
    private viewportScroller: ViewportScroller,
    private userState: UserStateService,
    private adminInfoService: AdminInfoService,
  ) {
    // Effect runs whenever the UID signal changes
    effect(() => {
      const uid = this.userState.uid();
      if (!uid) return;

      this.loadData(uid);
    });
  }

  // ========================
  // VIDEO LIGHTBOX
  // ========================
  openVideo() {
    this.showVideoLightbox = true;
  }

  closeVideo() {
    this.showVideoLightbox = false;
  }

  // ========================
  // LOAD ADMIN INFO
  // ========================
  async loadData(uid: string) {
    this.info = await this.adminInfoService.getAdminInfo(uid);
  }

  // ========================
  // GETTERS FOR HERO TEXT
  // ========================
  get firstWords() {
    if (!this.info?.mainJobTitle) return '';
    const words = this.info.mainJobTitle.split(' ');
    return words.slice(0, -1).join(' ');
  }

  get lastWord() {
    if (!this.info?.mainJobTitle) return '';
    const words = this.info.mainJobTitle.split(' ');
    return words[words.length - 1];
  }

  // ========================
  // SCROLL TO SECTION
  // ========================
  onClick(id: string) {
    this.viewportScroller.scrollToAnchor(id);
  }

  // ========================
  // CLEANUP
  // ========================
  ngOnDestroy(): void {
    // Complete destroy subject to clean any subscriptions if added later
    this.destroy$.next();
    this.destroy$.complete();

    // Reset all component data
    this.info = null;
    this.about = null;
    this.showVideoLightbox = false;
  }
}
