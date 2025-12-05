import { Component, AfterViewInit, ElementRef, ViewChild, HostListener, OnDestroy, NgZone } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
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
import { UiService } from '../../services/ui.service';
@Component({
  selector: 'app-admin-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './admin-navbar.html',
  styleUrls: ['./admin-navbar.scss']
})
export class AdminNavbar implements AfterViewInit, OnDestroy {
  @ViewChild('navbar') navbar!: ElementRef;

  sidebarOpen = false;
  livePortfolioEnabled = false;
  userEmail: string | null = null;
  uid: string | null = null;
  username: string | null = null;
  userInitial: string | null = null;
avatarColor: string = '#444';
  // For unsubscribing to observables
  private destroy$ = new Subject<void>();

  constructor(
    private dataCheck: AdminDataCheckService,
    private auth: AuthService,
    private adminInfoService: AdminInfoService,
    private adminAboutService: AdminAboutService,
    private adminExperienceService: AdminExperienceService,
    private adminProjectsService: AdminProjectsService,
    private zone: NgZone,
    private uiService:UiService,
    private router: Router
  ) {}

  // ===== DOWNLOAD CV =====
async downloadCV() {
  try {
    this.uiService.showLoader();
    if (!this.uid) { alert('User not logged in.'); this.uiService.hideLoader(); return; }

    // ===== FETCH DATA =====
    const info = await this.adminInfoService.getAdminInfo(this.uid);
    const about = await this.adminAboutService.getAbout(this.uid);
    const experience = await this.adminExperienceService.getExperience(this.uid);
    const projects = await this.adminProjectsService.getProjects(this.uid);

    if (!info || !about || !experience || !projects) {
      this.uiService.hideLoader();
      alert('Some data is missing.');
      return;
    }

    const skills = experience?.['skills'] || [];
    const education = experience?.['education'] || [];

    const doc = new jsPDF();
    let y = 15;
    const sectionSpacing = 8; 
    const lineHeight = 5; 

    const addSectionTitle = (title: string) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text(title, 10, y);
      y += lineHeight;
    };

    const addNormalText = (text: string, indent = 10) => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10); 
      const lines = doc.splitTextToSize(text, 186);
      doc.text(lines, indent, y);
      y += lines.length * lineHeight;
    };

    // ===== BASIC INFO =====
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(info?.['fullName'] || 'Your Name', 105, y, { align: 'center' });
    y += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    if (info?.['email']) { doc.text(`Email: ${info['email']}`, 10, y); y += 4; }
    if (info?.['phone']) { doc.text(`Phone: ${info['phone']}`, 10, y); y += sectionSpacing; }

    // ===== ABOUT ME =====
    if (about?.['mainDescription']) {
      addSectionTitle('About Me');
      addNormalText(about['mainDescription']);
      y += sectionSpacing;
    }

    // ===== EXPERIENCE =====
   const expList = experience?.['experiences'] || [];
if (expList.length) {
  addSectionTitle('Experience');

  y += 4; // ← Add extra space after section title

  expList.forEach((exp: any) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(`${exp.role} - ${exp.companyName}`, 10, y);
    y += lineHeight;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`${exp.startDate} - ${exp.endDate || 'Present'}`, 10, y);
    y += lineHeight;

    if (exp.description) addNormalText(`• ${exp.description}`, 12);
    y += 2; 
  });

  y += sectionSpacing;
}


    // ===== SKILLS =====
    if (skills.length) {
      addSectionTitle('Skills');
      addNormalText(skills.join(', '));
      y += sectionSpacing;
    }

    // ===== PROJECTS =====
    const projList = projects?.['projects'] || [];
    if (projList.length) {
      addSectionTitle('Projects');
      projList.forEach((p: any) => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text(p.projectTitle, 10, y);
        y += lineHeight;

        addNormalText((p.projectDescription || '').split(' ').slice(0, 25).join(' ') + '...');

        if (p.liveLink) {
          doc.text(`Live: ${p.liveLink}`, 12, y);
          y += lineHeight;
        }
        y += 2;
      });
      y += sectionSpacing;
    }

    // ===== EDUCATION =====
    if (education.length) {
      addSectionTitle('Education');
       y += 4;
      education.forEach((ed: any) => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text(ed.degree, 10, y);
        y += lineHeight;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(`${ed.institution} (${ed.start} - ${ed.end})`, 10, y);
        y += lineHeight;

        if (ed.description) addNormalText(ed.description, 12);
        y += 2; 
      });
      y += sectionSpacing;
    }

    // ===== SAVE PDF =====
    const pdfBlob = doc.output('blob');
    this.uiService.hideLoader();
    saveAs(pdfBlob, `${info?.['fullName'] || 'CV'}.pdf`);
    this.uiService.showCVSuccess();

  } catch (error) {
    console.error('Error downloading CV:', error);
    this.uiService.hideLoader();
    alert('Something went wrong while downloading CV. Please try again.');
  }
}


  // ===== LIFECYCLE HOOKS =====
  ngAfterViewInit() {
    // Subscribe to current user
    this.auth.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(async user => {
        if (user) {
          this.uid = user.uid;
           if (user.email) {
      this.userEmail = user.email;
      this.userInitial = user.email[0].toUpperCase();
      this.avatarColor = this.generateColorFromEmail(user.email);
    }
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
generateColorFromEmail(email: string): string {
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    hash = email.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color = `hsl(${hash % 360}, 70%, 50%)`;
  return color;
}
logout() {
    this.auth.logout()
      .then(() => this.router.navigate(['/sign-in']))
      .catch(err => console.error(err));
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
}
