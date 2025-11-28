import { Component, effect, OnDestroy } from '@angular/core';
import { AdminInfoService } from '../../services/admin-info.service';
import { UserStateService } from '../../services/user-state.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-slider-titles',
  standalone: true,
  templateUrl: './slider-titles.html',
  styleUrl: './slider-titles.scss',
})
export class SliderTitles implements OnDestroy {
  info: any = null;

  private destroy$ = new Subject<void>();

  constructor(
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

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.info = null;
  }
}
