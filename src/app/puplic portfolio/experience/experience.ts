import { Component, effect, Input, signal } from '@angular/core';
import { InViewDirective } from "../../directives/in-view.directive";
import { AdminExperienceService } from '../../services/admin-experience.service';
import { UserStateService } from '../../services/user-state.service';

@Component({
  selector: 'app-experience',
  imports: [InViewDirective],
  templateUrl: './experience.html',
  styleUrl: './experience.scss',
})
export class Experience {
   info: any = null;
    experience:any[]=[];
      constructor(
        private userState: UserStateService,
        private adminExperience: AdminExperienceService,
      ) {
        effect(() => {
          const uid = this.userState.uid();
          if (!uid) return;
    
          this.loadData(uid);
        });
      }
    
      async loadData(uid: string) {
        this.info = await this.adminExperience.getExperience(uid);
        this.experience=this.info.experiences;
      }
  
}
