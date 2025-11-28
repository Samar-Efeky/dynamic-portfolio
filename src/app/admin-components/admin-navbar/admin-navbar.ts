import { Component, AfterViewInit, ElementRef, ViewChild, HostListener, OnDestroy, NgZone } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AdminDataCheckService } from '../../services/admin-data-check';
import { AuthService } from '../../services/auth';
import { AdminInfoService } from '../../services/admin-info.service';
import { AdminAboutService } from '../../services/admin-about.service';
import { AdminExperienceService } from '../../services/admin-experience.service';
import { AdminProjectsService } from '../../services/admin-projects.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { saveAs } from 'file-saver';
@Component({
  selector: 'app-admin-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './admin-navbar.html',
  styleUrls: ['./admin-navbar.scss']
})
export class AdminNavbar implements AfterViewInit, OnDestroy {
  @ViewChild('navbar') navbar!: ElementRef;

  sidebarOpen = false;
  isFixed = false;
  navbarOffsetTop = 0;
  livePortfolioEnabled = false;

  uid: string | null = null;
  username: string | null = null;

  // For unsubscribing to observables
  private destroy$ = new Subject<void>();

  constructor(
    private dataCheck: AdminDataCheckService,
    private auth: AuthService,
    private adminInfoService: AdminInfoService,
    private adminAboutService: AdminAboutService,
    private adminExperienceService: AdminExperienceService,
    private adminProjectsService: AdminProjectsService,
    private zone: NgZone
  ) {}

  // ===== DOWNLOAD CV =====
 async downloadCV() {
    try {
      if (!this.uid) {
        alert('User not logged in.');
        return;
      }

      const info = await this.adminInfoService.getAdminInfo(this.uid);
      const about = await this.adminAboutService.getAbout(this.uid);
      const experience = await this.adminExperienceService.getExperience(this.uid);
      const projects = await this.adminProjectsService.getProjects(this.uid);

      if (!info || !about || !experience || !projects) {
        alert('Some data is missing. Please complete your profile before downloading CV.');
        return;
      }

      const skills = experience?.['skills'] || [];
      const education = experience?.['education'] || [];
      const doc = new jsPDF();
      let y = 10;

      // ===== BASIC INFO =====
      doc.setFontSize(18);
      doc.text(info?.['fullName'] || 'Your Name', 105, y, { align: 'center' });
      y += 10;

      doc.setFontSize(11);
      if (info?.['email']) doc.text(`Email: ${info['email']}`, 10, y);
      if (info?.['phone']) doc.text(`Phone: ${info['phone']}`, 10, y + 6);
      y += 15;

      // ===== ABOUT ME =====
      if (about?.['mainDescription']) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text('About Me', 10, y);
        y += 8;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        const aboutText = doc.splitTextToSize(about['mainDescription'], 186);
        doc.text(aboutText, 12, y);
        y += aboutText.length * 6 + 6;
      }

      // ===== EXPERIENCE =====
      const expList = experience?.['experiences']?.slice(0, 2) || [];
      if (expList.length) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.text('Experience', 10, y);
        y += 10;

        expList.forEach((exp: any) => {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(12);
          doc.text(`${exp.role} - ${exp.companyName}`, 10, y);
          y += 6;

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(11);
          doc.text(`${exp.startDate} - ${exp.endDate || 'Present'}`, 10, y);
          y += 6;

          if (exp.description) {
            const descLines = doc.splitTextToSize(`• ${exp.description}`, 186);
            doc.text(descLines, 12, y);
            y += descLines.length * 5 + 6;
          }
          y += 4;
        });
      }

      // ===== SKILLS =====
      if (skills.length) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text('Skills', 10, y);
        y += 8;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        const skillsText = skills.join(', ');
        const wrapped = doc.splitTextToSize(skillsText, 186);
        doc.text(wrapped, 12, y);
        y += wrapped.length * 5 + 8;
      }

      // ===== PROJECTS =====
      const projList = projects?.['projects']?.slice(0, 2) || [];
      if (projList.length) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text('Projects', 10, y);
        y += 10;

        projList.forEach((p: any) => {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(12);
          doc.text(p.projectTitle, 10, y);
          y += 6;

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(11);
          const desc = (p.projectDescription || '').split(' ').slice(0, 10).join(' ') + '...';
          const descText = doc.splitTextToSize(desc, 186);
          doc.text(descText, 12, y);
          y += descText.length * 5 + 4;

          if (p.liveLink) {
            doc.text(`Live: ${p.liveLink}`, 12, y);
            y += 8;
          }
          y += 5;
        });
      }

      // ===== EDUCATION =====
      if (education.length) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text('Education', 10, y);
        y += 10;

        education.forEach((ed: any) => {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(12);
          doc.text(ed.degree, 10, y);
          y += 6;

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(11);
          doc.text(`${ed.institution} (${ed.start} - ${ed.end})`, 10, y);
          y += 6;

          if (ed.description) {
            const edText = doc.splitTextToSize(ed.description, 186);
            doc.text(edText, 12, y);
            y += edText.length * 5 + 6;
          }
          y += 6;
        });
      }

      // ===== SAVE PDF USING FILE-SAVER (MOBILE & DESKTOP) =====
      const pdfBlob = doc.output('blob');
      saveAs(pdfBlob, `${info?.['fullName'] || 'CV'}.pdf`);

    } catch (error) {
      console.error('Error downloading CV:', error);
      alert('Something went wrong while downloading CV. Please try again.');
    }
  }


  // ===== LIFECYCLE HOOKS =====
  ngAfterViewInit() {
    this.navbarOffsetTop = this.navbar.nativeElement.offsetTop;

    // Subscribe to current user
    this.auth.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(async user => {
        if (user) {
          this.uid = user.uid;
          this.dataCheck.checkAllData(this.uid);

          const adminData = await this.adminInfoService.getAdminInfo(this.uid);
          if (adminData) this.username = adminData['username'];
        }
      });

    // Update livePortfolioEnabled state
    this.dataCheck.dataSaved$
      .pipe(takeUntil(this.destroy$))
      .subscribe(status => {
        this.zone.runOutsideAngular(() => {
          setTimeout(() => {
            this.livePortfolioEnabled = status;
          }, 0);
        });
      });
  }

  ngOnDestroy() {
    // Cleanup all subscriptions
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ===== UI HANDLERS =====
  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  openPortfolioInNewTab() {
    if (this.livePortfolioEnabled && this.username) {
      const url = `/portfolio/${encodeURIComponent(this.username)}`;
      window.open(url, '_blank');
    }
  }

  onScrollTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isFixed = window.scrollY >= this.navbarOffsetTop;
  }
}
