import { CommonModule } from '@angular/common';
import { Component, OnInit, AfterViewInit, OnDestroy, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormControl, AbstractControl, ValidationErrors } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AdminProjectsService } from '../../services/admin-projects.service';
import { AuthService } from '../../services/auth';
import { UiService } from '../../services/ui.service';
import { AdminDataCheckService } from '../../services/admin-data-check';

@Component({
  selector: 'app-admin-projects',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-projects.html',
  styleUrl: './admin-projects.scss'
})
export class AdminProjects implements OnInit, AfterViewInit, OnDestroy {

  form!: FormGroup;
  skillsControl!: FormControl;
  galleryControl!: FormControl;
  featuresControl!:FormControl;
  projects: any[] = [];
  userId: string | null = null;
  editingIndex: number | null = null;

  private destroy$ = new Subject<void>();

  @ViewChildren('autoResizeTextArea') textareas!: QueryList<ElementRef<HTMLTextAreaElement>>;

  constructor(
    private fb: FormBuilder,
    private projectsService: AdminProjectsService,
    private auth: AuthService,
    private uiService: UiService,
    private dataCheck: AdminDataCheckService
  ) {}

  ngOnInit() {
    this.skillsControl = new FormControl([], [Validators.required, this.minArrayLengthValidator(6)]);
    this.galleryControl = new FormControl([], [this.maxArrayLengthValidator(3)]);
    this.featuresControl = new FormControl([], [Validators.required, this.minArrayLengthValidator(3)]);
    this.form = this.fb.group({
      projectTitle: ['', Validators.required],
      projectDescription: ['', [Validators.required, this.wordCountValidator(40, 200)]],
      liveLink: [''],
      skills: this.skillsControl,
      gallery: this.galleryControl,
      features: this.featuresControl 
    });

    // Load user data safely
    this.auth.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(async user => {
        if (user) {
          this.userId = user.uid;
          await this.loadData();
        }
      });
  }

  ngAfterViewInit() {
    setTimeout(() => this.autoResizeAll(), 0);
  }

  ngOnDestroy() {
    // Clean up subscriptions
    this.destroy$.next();
    this.destroy$.complete();

    // Reset form and arrays
    this.form.reset();
    this.skillsControl.setValue([]);
    this.galleryControl.setValue([]);
    this.projects = [];
  }

  // ================= Validators =================
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

  // ================= Load Data =================
  async loadData() {
    if (!this.userId) return;
    const data = await this.projectsService.getProjects(this.userId);
    if (data?.['projects']) this.projects = data['projects'];
  }

  // ================= Skills =================
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

  // ================= Gallery =================
  uploadImage(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const gallery = [...this.galleryControl.value];
      if (gallery.length < 3) {
        gallery.push(reader.result as string);
        this.galleryControl.setValue(gallery);
      }
    };
    reader.readAsDataURL(file);
  }

  removeImage(i: number) {
    const gallery = [...this.galleryControl.value];
    gallery.splice(i, 1);
    this.galleryControl.setValue(gallery);
  }
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
  // ================= Projects =================
  addProject() {
   if (this.form.invalid) return;

  const newProject = {
    id: crypto.randomUUID(), 
    ...this.form.value
  };

  this.projects.push(newProject);

  // Reset form
  this.form.reset();
  this.skillsControl.setValue([]);
  this.galleryControl.setValue([]);
  this.featuresControl.setValue([]);
  }

  removeProject(i: number) {
    this.projects.splice(i, 1);
  }

  async saveAllProjects() {
    if (!this.userId) return;
    this.uiService.showLoader();
    try {
      await this.projectsService.saveProjects(this.userId, { projects: this.projects });
       await this.dataCheck.checkAllData(this.userId);
      this.uiService.hideLoader();
      this.uiService.showSuccess();
    } catch (err) {
      this.uiService.hideLoader();
      console.error(err);
      alert('An error occurred while saving data.');
    }
  }

  canAddProject() {
    return this.form.valid;
  }

  wordCount(c: string) {
    const v = this.form.get(c)?.value || '';
    return v.trim() ? v.trim().split(/\s+/).length : 0;
  }
editProject(i: number) {
  const p = this.projects[i];
  this.editingIndex = i;

  this.form.patchValue({
    projectTitle: p.projectTitle,
    projectDescription: p.projectDescription,
    liveLink: p.liveLink,
  });

  this.skillsControl.setValue([...p.skills]);
  this.galleryControl.setValue([...p.gallery]);
  this.featuresControl.setValue([...p.features]);
  window.scrollTo({ top: 300, behavior: 'smooth' });
}
updateProject() {
  if (this.form.invalid || this.editingIndex === null) return;

  this.projects[this.editingIndex] = {
    id: this.projects[this.editingIndex].id, 
    ...this.form.value
  };
  this.editingIndex = null;
  this.form.reset();
  this.skillsControl.setValue([]);
  this.galleryControl.setValue([]);
  this.featuresControl.setValue([]);
}
canUpdateProject() {
  return this.form.valid && this.editingIndex !== null;
}

  // ================= Auto Resize =================
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
}
