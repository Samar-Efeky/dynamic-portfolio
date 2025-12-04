import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AdminProjectsService } from '../../services/admin-projects.service';
import { CommonModule } from '@angular/common';
import { InViewDirective } from '../../directives/in-view.directive';
import { LoadingService } from '../../services/loading.service';

interface Project {
  id: string;
  title: string;
  description?: string;
  gallery?: string[];
  [key: string]: any;
}

@Component({
  selector: 'app-project-details',
  standalone: true,
  imports: [CommonModule,InViewDirective],
  templateUrl: './project-details.html',
  styleUrls: ['./project-details.scss'],
})
export class ProjectDetails implements OnInit, OnDestroy {
  projectId: string | null = null;
  project: Project | null = null;
  mainImage: string | null = null;
  lightboxOpen = false;
  currentIndex = 0;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private projectsService: AdminProjectsService,
    private loadingService:LoadingService
  ) {}

  ngOnInit() {
    this.route.paramMap
    .pipe(takeUntil(this.destroy$))
    .subscribe(params => {
      const uid = params.get('uid');   
      this.projectId = params.get('id');

      if (uid && this.projectId) {
        this.loadProject(uid, this.projectId);
      }
    });
  }

  async loadProject(uid: string, projectId: string) {
    this.loadingService.show();
    try {
      const projectData = await this.projectsService.getProjectById(uid, projectId);
      if (!projectData) return;
      this.project = projectData;
      if (this.project?.gallery?.length) {
        this.currentIndex = 0;
        this.mainImage = this.project.gallery[0];
      }
    } catch (err) {
      console.error('Error loading project:', err);
    } finally {
      this.loadingService.hide();
    }
  }

  selectImage(index: number) {
    if (!this.project?.gallery?.length) return;
    this.currentIndex = index;
    this.mainImage = this.project.gallery[index];
  }

  openLightbox() {
    if (!this.project?.gallery?.length) return;
    this.lightboxOpen = true;
  }

  closeLightbox() {
    this.lightboxOpen = false;
  }

  prevImage() {
    if (!this.project?.gallery?.length) return;
    this.currentIndex = (this.currentIndex - 1 + this.project.gallery.length) % this.project.gallery.length;
    this.mainImage = this.project.gallery[this.currentIndex];
  }

  nextImage() {
    if (!this.project?.gallery?.length) return;
    this.currentIndex = (this.currentIndex + 1) % this.project.gallery.length;
    this.mainImage = this.project.gallery[this.currentIndex];
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
