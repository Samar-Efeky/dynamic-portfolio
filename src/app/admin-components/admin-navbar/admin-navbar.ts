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
    if (!this.uid) return alert("User not logged in.");

    const info = await this.adminInfoService.getAdminInfo(this.uid);
    const about = await this.adminAboutService.getAbout(this.uid);
    const experience = await this.adminExperienceService.getExperience(this.uid);
    const projects = await this.adminProjectsService.getProjects(this.uid);

    const skills = experience?.['skills'] || [];
    const education = experience?.['education'] || [];
    const expList = experience?.['experiences'] || [];
    const projList = projects?.['projects'] || [];

    const doc = new jsPDF({ unit: "pt", format: "a4" });
    let y = 40;
    const maxHeight = doc.internal.pageSize.height - 60;

    // === PAGE CHECK ===
    const checkPage = (spaceNeeded = 20) => {
      if (y + spaceNeeded > maxHeight) {
        doc.addPage();
        y = 40;
      }
    };

    // === MULTILINE PRINT ===
    const printMultiline = (textArray: string[], x: number) => {
      textArray.forEach(line => {
        checkPage(25);
        doc.text(line, x, y);
        y += 14;
      });
    };

    // === SECTION TITLE ===
    const sectionTitle = (title: string) => {
      checkPage(40);
      y += 12;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text(title.toUpperCase(), 40, y);
      y += 14;
      doc.setLineWidth(0.3);
      doc.line(40, y, 555, y);
      y += 14;
    };

    // ================= HEADER =================
    checkPage(50);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(info?.['fullName'] || '', 40, y);
    y += 15;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(info?.['jobTitle'] || '', 40, y);
    y += 12;

    doc.setFontSize(10);
    doc.text(
      `${info?.['phone'] || ''} | ${info?.['email'] || ''} | ${info?.['location'] || ''}`,
      40,
      y
    );
    y += 20;
    // ================= SUMMARY =================
    if (about?.['mainDescription']) {
  sectionTitle("Summary");
  doc.setFont("helvetica", "normal"); 
  doc.setFontSize(10);

  const summaryLines = doc.splitTextToSize(about['mainDescription'], 515);
  printMultiline(summaryLines, 40);
  y += 6;
}


    // ================= EXPERIENCE =================
    if (expList.length) {
      sectionTitle("Experience");

      expList.forEach((exp: any) => {

        checkPage(50);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text(exp.role || "", 40, y);
        y += 14;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text(`${exp.companyName || ""} | ${exp.startDate} - ${exp.endDate || "Present"}`, 40, y);
        y += 14;

        if (exp.description) {
          const desc = doc.splitTextToSize("• " + exp.description, 500);
          printMultiline(desc, 50);
        }

        y += 10; 
      });

      y += 10;
    }

    // ================= SKILLS =================
    if (skills.length) {
  sectionTitle("Skills");

  let startX = 40;
  const maxWidth = 515;
    y+=12
  skills.forEach((skill: string) => {
    const tagWidth = doc.getTextWidth(skill) + 16;

    if (startX + tagWidth > maxWidth) {
      startX = 40;
      y += 24;
      checkPage(30);
    }

    doc.setDrawColor(20);
    doc.setFillColor(240, 240, 240);
    doc.roundedRect(startX, y - 12, tagWidth, 22, 6, 6, "FD");

    doc.setFontSize(10); 
    doc.text(skill, startX + 8, y + 3);

    startX += tagWidth + 8;
  });

  y += 30;
}

    // ================= PROJECTS =================
   if (projList.length) {
  sectionTitle("Projects");

  projList.forEach((p: any) => {

    checkPage(50);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(p.projectTitle || "", 40, y);
    y += 14;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10); 
    const desc = doc.splitTextToSize(p.projectDescription.split(' ').slice(0, 30).join(' ') || "", 515);
    printMultiline(desc, 40);

    if (p.liveLink) {
      checkPage(20);
      doc.setTextColor(30, 60, 160);
      doc.text(p.liveLink, 40, y);
      doc.setTextColor(0, 0, 0);
      y += 16;
    }

    y += 6;
  });

  y += 10;
}
    // ================= EDUCATION =================
    if (education.length) {
      sectionTitle("Education");

      education.forEach((ed: any) => {
        checkPage(40);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text(ed.degree || "", 40, y);
        y += 14;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text(`${ed.institution} (${ed.start} - ${ed.end})`, 40, y);
        y += 20;
      });
    }

    this.uiService.hideLoader();
    saveAs(doc.output("blob"), `${info?.['fullName'] || 'CV'}.pdf`);
    this.uiService.showCVSuccess();

  } catch (err) {
    this.uiService.hideLoader();
    console.error(err);
    alert("Error while generating CV");
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
