import { Component, OnDestroy } from '@angular/core';
import { AdminNavbar } from "../admin-components/admin-navbar/admin-navbar";
import { Router, RouterOutlet } from '@angular/router';
import { FooterAdmin } from "../admin-components/footer-admin/footer-admin";
import { AuthService } from '../services/auth';
import { UiService } from '../services/ui.service';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-portfolio',
  imports: [AdminNavbar, RouterOutlet, FooterAdmin, CommonModule],
  templateUrl: './admin-portfolio.html',
  styleUrls: ['./admin-portfolio.scss'],
  standalone: true
})
export class AdminPortfolio implements OnDestroy {
  userImage: string = 'img/img3.png';
  userEmail = '';
  uid = '';
  loading = true;
  loading$!: Observable<boolean>;
  showSuccess$!: Observable<boolean>;

  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private router: Router,
    public uiService: UiService
  ) {}

  async ngOnInit() {
    this.loading$ = this.uiService.loading$.pipe(takeUntil(this.destroy$));
    this.showSuccess$ = this.uiService.success$.pipe(takeUntil(this.destroy$));

    const storedUid = this.authService.getUidFromStorage();
    if (!storedUid) {
      this.router.navigate(['/sign-in']);
      return;
    }

    this.uid = storedUid;
    const profile = await this.authService.getUserProfile(this.uid);
    if (profile?.['imageUrl']) this.userImage = profile['imageUrl'];
    this.userEmail = profile?.['email'] ?? '';
    this.loading = false;
  }

  onImageChange(event: any) {
    const file = event.target.files[0];
    if (!file || !this.uid) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      this.userImage = base64;
      await this.authService.saveUserProfile(this.uid, { imageUrl: base64 });
    };
    reader.readAsDataURL(file);
  }

  logout() {
    this.authService.logout()
      .then(() => this.router.navigate(['/sign-in']))
      .catch(err => console.error(err));
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.userImage = 'img/img3.png';
    this.userEmail = '';
    this.uid = '';
  }
}
