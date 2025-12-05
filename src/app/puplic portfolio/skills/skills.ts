import { Component, effect, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserStateService } from '../../services/user-state.service';
import { AdminExperienceService } from '../../services/admin-experience.service';
import { InViewDirective } from '../../directives/in-view.directive';

@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [CommonModule, InViewDirective],
  templateUrl: './skills.html',
  styleUrls: ['./skills.scss'],
})
export class Skills {

  info: any = null;
  skills: string[] = [];

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

    // cleanup
    this.destroyRef.onDestroy(() => {
      effectRef.destroy();
    });
  }

  async loadData(uid: string) {
    this.info = await this.adminExperience.getExperience(uid);
    this.skills = this.info.skills;
  }
}
