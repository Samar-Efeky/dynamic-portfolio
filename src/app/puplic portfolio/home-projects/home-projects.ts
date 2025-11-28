import { Component, effect, OnDestroy } from '@angular/core';
import { RouterLink } from "@angular/router";
import { InViewDirective } from "../../directives/in-view.directive";
import { UserStateService } from '../../services/user-state.service';
import { AdminProjectsService } from '../../services/admin-projects.service';
@Component({
  selector: 'app-home-projects',
  imports: [RouterLink, InViewDirective],
  templateUrl: './home-projects.html',
  styleUrl: './home-projects.scss',
})
export class HomeProjects implements OnDestroy {

  projectsList: any = null;
  info: any = null;
  username: any = null;
  uid: any = null;

  private destroyed = false;
  private dataLoaded = false;

  constructor(
    private userState: UserStateService,
    private adminProjectService: AdminProjectsService
  ) {

    effect(() => {
      if (this.destroyed) return;

      const currentUid = this.userState.uid();
      this.username=userState.username();
      if (!currentUid) return;
      if (this.dataLoaded && this.uid === currentUid) return;

      this.uid = currentUid;
      this.dataLoaded = true;

      this.loadData(this.uid);
    });
  }

  async loadData(uid: string) {
    this.projectsList = await this.adminProjectService.getProjects(uid);
  }

  scrollToTop() {
    window.scrollTo({ top: 0 });
  }

  ngOnDestroy() {
    this.destroyed = true;
  }
}
