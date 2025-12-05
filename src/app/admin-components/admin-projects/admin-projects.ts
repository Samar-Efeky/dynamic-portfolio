// src/app/admin-components/admin-projects/admin-projects.component.ts
import { Component, OnInit, AfterViewInit, OnDestroy, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, AbstractControl, ValidationErrors, ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AdminProjectsService } from '../../services/admin-projects.service';
import { AuthService } from '../../services/auth';
import { UiService } from '../../services/ui.service';
import { AdminDataCheckService } from '../../services/admin-data-check';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-admin-projects',
  standalone: true,
  imports: [ReactiveFormsModule, DragDropModule],
  templateUrl: './admin-projects.html',
  styleUrl: './admin-projects.scss'
})
export class AdminProjects implements OnInit, AfterViewInit, OnDestroy {

  // ------------------ Form Controls ------------------
  form!: FormGroup;
  skillsControl!: FormControl;
  galleryControl!: FormControl;
  featuresControl!: FormControl;

  // ------------------ Projects Data ------------------
  projects: any[] = [];
  userId: string | null = null;
  editingIndex: number | null = null;

  // ------------------ Lifecycle Helpers ------------------
  private destroy$ = new Subject<void>();

  // Reference all textareas for auto-resize
  @ViewChildren('autoResizeTextArea') textareas!: QueryList<ElementRef<HTMLTextAreaElement>>;

  // Temporary URLs of uploaded images (not yet saved in Firestore)
  private tempUploadedImages: string[] = [];

  // beforeunload handler reference
  private beforeUnloadHandler: () => void = () => { void this.cleanupUnSavedImages(); };

  constructor(
    private fb: FormBuilder,
    private projectsService: AdminProjectsService,
    private auth: AuthService,
    private uiService: UiService,
    private dataCheck: AdminDataCheckService
  ) {}

  // ------------------ Lifecycle Hooks ------------------
  async ngOnInit() {
    // Attach beforeunload to cleanup unsaved images
    window.addEventListener('beforeunload', this.beforeUnloadHandler);

    // Initialize form controls with validators
    this.skillsControl = new FormControl([], [Validators.required, this.minArrayLengthValidator(6)]);
    this.galleryControl = new FormControl([], [this.maxArrayLengthValidator(5)]);
    this.featuresControl = new FormControl([], [Validators.required, this.minArrayLengthValidator(3)]);

    this.form = this.fb.group({
      projectTitle: ['', Validators.required],
      projectDescription: ['', [Validators.required, this.wordCountValidator(40, 200)]],
      liveLink: [''],
      skills: this.skillsControl,
      gallery: this.galleryControl,
      features: this.featuresControl
    });

    // Subscribe to current user and clean up storage if necessary
    this.auth.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(async user => {
        if (user) {
          this.userId = user.uid;
          try {
            await this.cleanupStorageOnInit();
          } catch (err) {
            console.error('cleanupStorageOnInit failed', err);
          }
          await this.loadData();
        }
      });
  }

  ngAfterViewInit() {
    // Auto-resize all textareas on init
    setTimeout(() => this.autoResizeAll(), 0);
  }

  ngOnDestroy() {
    // Remove beforeunload listener
    window.removeEventListener('beforeunload', this.beforeUnloadHandler);

    // Complete RxJS subscriptions
    this.destroy$.next();
    this.destroy$.complete();

    // Reset form and temporary states
    this.form.reset();
    this.skillsControl.setValue([]);
    this.galleryControl.setValue([]);
    this.projects = [];
  }

  // ------------------ Drag & Drop ------------------
  drop(event: CdkDragDrop<any>) {
  moveItemInArray(this.projects, event.previousIndex, event.currentIndex);

  // Update Firestore instantly after sorting
  this.saveAllProjects();
}
  // ------------------ Validators ------------------
  wordCountValidator(min: number, max: number) {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value || !control.value.trim()) return { required: true };
      const wc = control.value.trim().split(/\s+/).length;
      if (wc < min) return { minWords: wc };
      if (wc > max) return { maxWords: wc };
      return null;
    };
  }

  minArrayLengthValidator(min: number) {
    return (control: AbstractControl): ValidationErrors | null => {
      const arr = control.value || [];
      return arr.length < min ? { minArray: { length: arr.length } } : null;
    };
  }

  maxArrayLengthValidator(max: number) {
    return (control: AbstractControl): ValidationErrors | null => {
      const arr = control.value || [];
      return arr.length > max ? { maxArray: { length: arr.length } } : null;
    };
  }

  // ------------------ Load Projects ------------------
  async loadData() {
    if (!this.userId) return;
    const data = await this.projectsService.getProjects(this.userId);
    if (data?.['projects']) this.projects = data['projects'];
  }

  // ------------------ Skills ------------------
  addSkill(value: string) {
    const v = value.trim();
    if (!v) return;
    const skills = [...this.skillsControl.value];
    if (!skills.some(s => s.toLowerCase() === v.toLowerCase())) {
      skills.push(v);
      this.skillsControl.setValue(skills);
    }
  }

  removeSkill(i: number) {
    const skills = [...this.skillsControl.value];
    skills.splice(i, 1);
    this.skillsControl.setValue(skills);
  }

  // ------------------ Gallery (Upload & Temp Tracking) ------------------
  async uploadImage(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !this.userId) return;
    try {
      const url = await this.projectsService.uploadImage(this.userId, file);

      const gallery = [...this.galleryControl.value];
      if (gallery.length < 5) {
        gallery.push(url);
        this.galleryControl.setValue(gallery);

        // Mark image as temporarily uploaded
        this.tempUploadedImages.push(url);
      }
    } catch (err) {
      console.error(err);
      alert('Error uploading image');
    } finally {
      if (input) input.value = '';
    }
  }

  async removeImage(i: number) {
    const gallery = [...this.galleryControl.value];
    const url = gallery[i];
    if (url) {
      try {
        await this.projectsService.deleteImage(url);
      } catch (err) {
        console.error('Failed to delete image from storage', err);
      }
    }
    gallery.splice(i, 1);
    this.galleryControl.setValue(gallery);

    // Remove from temporary images if exists
    this.tempUploadedImages = this.tempUploadedImages.filter(u => u !== url);
  }

  // ------------------ Features ------------------
  addFeature(value: string) {
    const v = value.trim();
    if (!v) return;
    const features = [...this.featuresControl.value];
    features.push(v);
    this.featuresControl.setValue(features);
  }

  removeFeature(i: number) {
    const features = [...this.featuresControl.value];
    features.splice(i, 1);
    this.featuresControl.setValue(features);
  }

  // ------------------ Projects CRUD ------------------
  async addProject() {
    if (this.form.invalid) return;

    const newProject = {
      id: crypto.randomUUID(),
      ...this.form.value,
      gallery: [...this.galleryControl.value]
    };

    this.projects.push(newProject);
    await this.saveAllProjects();
    this.markTempImagesAsSaved(newProject.gallery);

    // Reset form and controls
    this.form.reset();
    this.skillsControl.setValue([]);
    this.galleryControl.setValue([]);
    this.featuresControl.setValue([]);
  }

  removeProject(i: number) {
    const p = this.projects[i];
    if (p?.gallery?.length) {
      p.gallery.forEach(async (url: string) => {
        try { await this.projectsService.deleteImage(url); } catch (err) { console.error(err); }
      });
    }
    this.projects.splice(i, 1);
  }

  async saveAllProjects() {
    if (!this.userId) return;
    this.uiService.showLoader();
    try {
      this.projects.forEach(p => {
        if (Array.isArray(p.gallery)) this.markTempImagesAsSaved(p.gallery);
      });

      await this.projectsService.saveProjects(this.userId, { projects: this.projects });
      await this.dataCheck.checkAllData(this.userId);

      this.tempUploadedImages = [];
      this.uiService.hideLoader();
      this.uiService.showSuccess();
    } catch (err) {
      this.uiService.hideLoader();
      console.error(err);
      alert('Error saving projects');
    }
  }

  editProject(i: number) {
    const p = this.projects[i];
    this.editingIndex = i;
    this.form.patchValue({
      projectTitle: p.projectTitle,
      projectDescription: p.projectDescription,
      liveLink: p.liveLink
    });

    this.skillsControl.setValue([...p.skills || []]);
    this.galleryControl.setValue([...p.gallery || []]);
    this.featuresControl.setValue([...p.features || []]);

    setTimeout(() => this.autoResizeAll(), 0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async updateProject() {
    if (this.form.invalid || this.editingIndex === null) return;

    this.projects[this.editingIndex] = {
      id: this.projects[this.editingIndex].id,
      ...this.form.value,
      gallery: [...this.galleryControl.value || []]
    };

    await this.saveAllProjects();
    this.markTempImagesAsSaved(this.galleryControl.value || []);

    this.editingIndex = null;
    this.form.reset();
    this.skillsControl.setValue([]);
    this.galleryControl.setValue([]);
    this.featuresControl.setValue([]);
  }

  // ------------------ Temporary Images Management ------------------
  private markTempImagesAsSaved(urls: string[]) {
    this.tempUploadedImages = this.tempUploadedImages.filter(t => !urls.includes(t));
  }

  private async cleanupUnSavedImages() {
    if (!this.tempUploadedImages || this.tempUploadedImages.length === 0) return;

    const copy = [...this.tempUploadedImages];
    this.tempUploadedImages = [];

    for (const url of copy) {
      try {
        await this.projectsService.deleteImage(url);
      } catch (err) {
        console.error('Failed to delete temp image', err);
      }
    }
  }

  private async cleanupStorageOnInit() {
    if (!this.userId) return;

    try {
      const allImagesFullPath = await this.projectsService.listAllProjectImages(this.userId);
      const data = await this.projectsService.getProjects(this.userId);
      const savedImagesUrls: string[] = data?.['projects']?.flatMap((p: any) => p.gallery || []) || [];

      const filenameFromFullPath = (fp: string) => {
        const parts = (fp || '').split('/');
        return parts[parts.length - 1] || fp;
      };

      const savedFilenames = savedImagesUrls.map(u => {
        try {
          const decoded = decodeURIComponent(u || '');
          const afterO = decoded.split('/o/')[1] || decoded;
          const fname = afterO.split('?')[0].split('/').pop() || '';
          return fname;
        } catch {
          return u.split('/').pop() || u;
        }
      }).filter(Boolean);

      const tempFullPaths = allImagesFullPath.filter(fp => {
        const fn = filenameFromFullPath(fp);
        return !savedFilenames.some(sf => sf.includes(fn));
      });

      for (const fp of tempFullPaths) {
        try {
          await this.projectsService.deleteImage(fp);
        } catch (err) {
          console.error('Failed to delete unused image', fp, err);
        }
      }
    } catch (err) {
      console.error('cleanupStorageOnInit error', err);
    }
  }

  // ------------------ Autosize Textarea ------------------
  autoResize(event: Event) {
    const el = event.target as HTMLTextAreaElement;
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  }

  autoResizeAll() {
    this.textareas?.forEach(a => {
      const el = a.nativeElement;
      el.style.overflow = 'hidden';
      el.style.height = 'auto';
      el.style.height = el.scrollHeight + 'px';
    });
  }

  wordCount(c: string) {
    const v = this.form.get(c)?.value || '';
    return v.trim() ? v.trim().split(/\s+/).length : 0;
  }

  // ------------------ Small Helpers / UI ------------------
  canAddProject() { return this.form.valid; }
  canUpdateProject() { return this.form.valid && this.editingIndex !== null; }

}
