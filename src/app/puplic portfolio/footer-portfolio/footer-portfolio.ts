import { Component, effect, OnDestroy, signal } from '@angular/core';
import { RouterLink } from "@angular/router";
import { AdminInfoService } from '../../services/admin-info.service';
import { UserStateService } from '../../services/user-state.service';
import { NewsletterService } from '../../services/newsletter.service';
import { UiService } from '../../services/ui.service';
import { CommonModule } from '@angular/common';
import { Observable, Subject, takeUntil } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-footer-portfolio',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './footer-portfolio.html',
  styleUrls: ['./footer-portfolio.scss']
})
export class FooterPortfolio implements OnDestroy {
  info: any = null;
  email: string = '';
  message: string = '';
  emailSuccess$!: Observable<boolean>;
  currentYear: number = new Date().getFullYear();

  private destroyed$ = new Subject<void>();  
  private dataLoaded = false;
  private currentUid: string | null = null;

  constructor(
    private userState: UserStateService,
    private adminInfoService: AdminInfoService,
    private newsletterService: NewsletterService,
    private ui: UiService
  ) {
    effect(() => {
      const uid = this.userState.uid();
      if (!uid) return;
      if (this.dataLoaded && this.currentUid === uid) return;

      this.currentUid = uid;
      this.dataLoaded = true;
      this.loadData(uid);
    });

    this.emailSuccess$ = this.ui.emailSuccess$.pipe(
      takeUntil(this.destroyed$) 
    );
  }

  async loadData(uid: string) {
    this.info = await this.adminInfoService.getAdminInfo(uid);
  }

  async subscribe() {
    if (!this.email.trim()) return;

    try {
      await this.newsletterService.addSubscriber(this.email);
      this.ui.showEmailSuccess();  
      this.email = "";
    } catch (err: any) {
      if (err.message === 'EMAIL_EXISTS') {
        alert("Email already subscribed!");
      }
    }
  }

  scrollToTop() {
    window.scrollTo({ top: 0 });
  }

  ngOnDestroy() {
    this.destroyed$.next();   
    this.destroyed$.complete();
    this.info = null;
    this.dataLoaded = false;
  }
}
