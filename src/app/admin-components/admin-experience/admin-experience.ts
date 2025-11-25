import { Component, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder, FormGroup, ReactiveFormsModule,
  Validators, FormArray, AbstractControl
} from '@angular/forms';

import { AuthService } from '../../services/auth';
import { AdminExperienceService } from '../../services/admin-experience.service';
import { UiService } from '../../services/ui.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-admin-experience',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-experience.html',
  styleUrl: './admin-experience.scss'
})
export class AdminExperience implements OnInit, OnDestroy {

  form!: FormGroup;
  userId: string | null = null;

  // cleanup helpers
  private subs = new Subscription();
  private resizeTimeout: any = null;
  private textareaElements: HTMLTextAreaElement[] = [];
  private fileReaders: FileReader[] = [];

  constructor(
    private fb: FormBuilder,
    private expService: AdminExperienceService,
    private auth: AuthService,
    private el: ElementRef,
    private uiService: UiService
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      experiences: this.fb.array([], Validators.required),
      skills: this.fb.array([], [Validators.required, this.minLengthArray(6)]),
      education: this.fb.array([], Validators.required),
      certifications: this.fb.array([], Validators.required),

      experienceInput: this.fb.group({
        companyName: ['', Validators.required],
        role: ['', Validators.required],
        startDate: ['', Validators.required],
        endDate: ['', Validators.required],
        description: ['', [Validators.required, this.wordCountValidator(10, 25)]]
      }),

      skillInput: [''],

      educationInput: this.fb.group({
        institution: ['', Validators.required],
        degree: ['', Validators.required],
        start: ['', Validators.required],
        end: ['', Validators.required]
      })
    });

    // store subscription so we can unsubscribe on destroy
    const sub = this.auth.currentUser$.subscribe(async (u) => {
      if (u) {
        this.userId = u.uid;
        await this.loadData();
        // after load, cache textareas for resize/cleanup
        this.cacheTextareaElements();
        // initial resize
        this.scheduleAutoResize(0);
      }
    });
    this.subs.add(sub);
  }

  // ====================
  // Validators
  // ====================
  wordCountValidator(min: number, max: number) {
    return (control: AbstractControl) => {
      const text = control.value?.trim();
      if (!text) return { wordCount: true };
      const count = text.split(/\s+/).length;
      return count < min || count > max ? { wordCount: true } : null;
    };
  }

  minLengthArray(min: number) {
    return (control: AbstractControl) => {
      return (control as FormArray).length < min ? { minLengthArray: true } : null;
    };
  }

  // ====================
  // Getters
  // ====================
  get experiences() { return this.form.get('experiences') as FormArray; }
  get skills() { return this.form.get('skills') as FormArray; }
  get education() { return this.form.get('education') as FormArray; }
  get certifications() { return this.form.get('certifications') as FormArray; }
  get descriptionControl() { return this.form.get('experienceInput.description')!; }

  get canSave() {
    return (
      this.experiences.length > 0 &&
      this.education.length > 0 &&
      this.skills.length >= 6 &&
      this.certifications.length > 0
    );
  }

  // ====================
  // Auto resize helpers
  // ====================
  private cacheTextareaElements() {
    // cache textareas inside this component only
    try {
      this.textareaElements = Array.from(
        (this.el.nativeElement as HTMLElement).querySelectorAll('textarea[formcontrolname="description"]')
      ) as HTMLTextAreaElement[];
    } catch (err) {
      this.textareaElements = [];
    }
  }

  private scheduleAutoResize(delay = 50) {
    if (this.resizeTimeout) clearTimeout(this.resizeTimeout);
    this.resizeTimeout = setTimeout(() => this.autoResize(), delay);
  }

  autoResize() {
    // resize cached textareas (if none cached, try to cache once)
    if (!this.textareaElements || this.textareaElements.length === 0) {
      this.cacheTextareaElements();
    }

    this.textareaElements.forEach(textarea => {
      try {
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
      } catch (e) {
        // ignore if DOM changed
      }
    });
  }

  // ====================
  // Load Data
  // ====================
  async loadData() {
    if (!this.userId) return;

    const data = await this.expService.getExperience(this.userId);
    if (!data) return;

    // Experiences
    this.experiences.clear();
    (data['experiences'] || []).forEach((exp: any) => {
      this.experiences.push(this.fb.group(exp));
    });

    // Skills
    this.skills.clear();
    (data['skills'] || []).forEach((s: any) => this.skills.push(this.fb.control(s)));

    // Education
    this.education.clear();
    (data['education'] || []).forEach((edu: any) => this.education.push(this.fb.group(edu)));

    // Certifications
    this.certifications.clear();
    (data['certifications'] || []).forEach((c: any) => this.certifications.push(this.fb.control(c)));

    // after patching values, schedule resize
    this.scheduleAutoResize(50);
  }

  // ====================
  // Experience
  // ====================
  addExperience() {
    const g = this.form.get('experienceInput') as FormGroup;
    if (g.invalid) { g.markAllAsTouched(); return; }
    this.experiences.push(this.fb.group(g.value));
    g.reset();
    // re-cache textareas in case a new one was added via template changes
    this.cacheTextareaElements();
    this.scheduleAutoResize(0);
  }

  removeExperience(i: number) { this.experiences.removeAt(i); }

  // ====================
  // Skills
  // ====================
  addSkill() {
    const v: string = this.form.value.skillInput?.trim();
    if (!v) return;
    if (!this.skills.value.includes(v)) this.skills.push(this.fb.control(v));
    this.form.patchValue({ skillInput: '' });
  }

  removeSkill(i: number) { this.skills.removeAt(i); }

  // ====================
  // Education
  // ====================
  addEducation() {
    const g = this.form.get('educationInput') as FormGroup;
    if (g.invalid) { g.markAllAsTouched(); return; }
    this.education.push(this.fb.group(g.value));
    g.reset();
  }

  removeEducation(i: number) { this.education.removeAt(i); }

  // ====================
  // Certifications
  // ====================
  uploadCert(event: Event) {
    if (this.certifications.length >= 3) return;

    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    // store reader so we can abort on destroy
    this.fileReaders.push(reader);

    reader.onload = () => {
      // push base64 (or whatever result) into form array
      this.certifications.push(this.fb.control(reader.result as string));
      // remove this reader from tracking (it's completed)
      const idx = this.fileReaders.indexOf(reader);
      if (idx >= 0) this.fileReaders.splice(idx, 1);
    };

    reader.onerror = () => {
      // remove from tracking on error
      const idx = this.fileReaders.indexOf(reader);
      if (idx >= 0) this.fileReaders.splice(idx, 1);
      console.error('FileReader error', reader.error);
    };

    reader.readAsDataURL(file);

    // clear input's value to allow same file upload again if needed
    try { input.value = ''; } catch (e) {}
  }

  removeCert(i: number) { this.certifications.removeAt(i); }

  // ====================
  // Save Data
  // ====================
  async save() {
    if (!this.userId) { alert('User not logged in'); return; }
    if (!this.canSave) { alert('Please complete all required fields'); return; }
    this.uiService.showLoader();
    const data = {
      experiences: this.experiences.value,
      skills: this.skills.value,
      education: this.education.value,
      certifications: this.certifications.value
    };
    try {
      await this.expService.saveExperience(this.userId!, data);
      this.uiService.hideLoader();
      this.uiService.showSuccess();
    } catch (err) {
      this.uiService.hideLoader();
      console.error(err);
      alert('An error occurred while saving data.');
    }
  }

  // ====================
  // Cleanup on destroy
  // ====================
  ngOnDestroy() {
    // 1) Unsubscribe all subscriptions
    this.subs.unsubscribe();

    // 2) Clear timeout if any
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
      this.resizeTimeout = null;
    }

    // 3) Abort any active FileReaders
    this.fileReaders.forEach(fr => {
      try {
        fr.onload = null;
        fr.onerror = null;
        // abort exists in some browsers
        if (typeof fr['abort'] === 'function') (fr as any).abort();
      } catch (e) {}
    });
    this.fileReaders = [];

    // 4) Clear cached textarea elements refs
    this.textareaElements = [];

    // 5) Clear form arrays and reset form for GC
    try {
      this.experiences.clear();
      this.skills.clear();
      this.education.clear();
      this.certifications.clear();
    } catch (e) { /* ignore if already destroyed */ }

    try {
      this.form.reset();
    } catch (e) { /* ignore if already destroyed */ }

    // 6) Null out ids / refs
    this.userId = null;
  }
}
