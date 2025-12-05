import { Component, effect, DestroyRef } from '@angular/core';
import { InViewDirective } from "../../directives/in-view.directive";
import { UserStateService } from '../../services/user-state.service';
import { AdminExperienceService } from '../../services/admin-experience.service';

@Component({
  selector: 'app-education',
  imports: [InViewDirective],
  templateUrl: './education.html',
  styleUrl: './education.scss',
})
export class Education {

  info: any = null;
  education: any[] = [];

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

    // Cleanup effect on destroy - prevents memory leak
    this.destroyRef.onDestroy(() => {
      effectRef.destroy();
    });
  }

  async loadData(uid: string) {
    this.info = await this.adminExperience.getExperience(uid);
    this.education = this.info.education;
  }
}
