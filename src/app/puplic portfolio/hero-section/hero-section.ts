import { Component, OnDestroy, effect, signal } from '@angular/core';
import { CommonModule, ViewportScroller } from '@angular/common';
import { AdminInfoService } from '../../services/admin-info.service';
import { UserStateService } from '../../services/user-state.service';
import { Subject, takeUntil } from 'rxjs';
@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero-section.html',
  styleUrls: ['./hero-section.scss'],
})
export class HeroSection implements OnDestroy {
  info: any = null;
  about: any = null;
  private destroy$ = new Subject<void>();

  constructor(
    private viewportScroller: ViewportScroller,
    private userState: UserStateService,
    private adminInfoService: AdminInfoService,
  ) {
    effect(() => {
      const uid = this.userState.uid();
      if (!uid) return;

      this.loadData(uid);
    });
  }

  async loadData(uid: string) {
    this.info = await this.adminInfoService.getAdminInfo(uid);
  }

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

  onClick(id: string) {
    this.viewportScroller.scrollToAnchor(id);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
