import { Component, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth';
import { AdminExperienceService } from '../../services/admin-experience.service';
import { UiService } from '../../services/ui.service';
import { AdminDataCheckService } from '../../services/admin-data-check';

@Component({
  selector: 'app-admin-experience',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './admin-experience.html',
  styleUrls: ['./admin-experience.scss']
})
export class AdminExperience implements OnInit, OnDestroy {
  form!: FormGroup;
  userId: string | null = null;

  private subs = new Subscription();
  private resizeTimeout: any = null;
  private textareaElements: HTMLTextAreaElement[] = [];
  certFiles: File[] = [];
  certPreviews: string[] = [];
  savedCerts: string[] = [];

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private expService: AdminExperienceService,
    private uiService: UiService,
    private dataCheck: AdminDataCheckService,
    private el: ElementRef
  ) {}

  ngOnInit() {
     this.certFiles = [];
  this.certPreviews = [];
    // ====================
    // Initialize Form
    // ====================
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
        end: ['', Validators.required],
        description: ['', [Validators.required, this.wordCountValidator(10, 25)]]
      })
    });

    // ====================
    // Load User Data
    // ====================
    this.subs.add(this.auth.currentUser$.subscribe(async u => {
      if (u) {
        this.userId = u.uid;
        await this.loadData();
        this.cacheTextareaElements();
        this.scheduleAutoResize(0);
      }
    }));
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
    return (control: AbstractControl) =>
      (control as FormArray).length < min ? { minLengthArray: true } : null;
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
    return this.experiences.length > 0 &&
           this.education.length > 0 &&
           this.skills.length >= 6 &&
         (this.certPreviews.length + this.savedCerts.length > 0);
  }

  // ====================
  // Auto Resize for Textareas
  // ====================
  private cacheTextareaElements() {
    try {
      this.textareaElements = Array.from(
        this.el.nativeElement.querySelectorAll('textarea[formcontrolname="description"]')
      ) as HTMLTextAreaElement[];
    } catch {
      this.textareaElements = [];
    }
  }

  private scheduleAutoResize(delay = 50) {
    if (this.resizeTimeout) clearTimeout(this.resizeTimeout);
    this.resizeTimeout = setTimeout(() => this.autoResize(), delay);
  }

  autoResize() {
    this.cacheTextareaElements();
    this.textareaElements.forEach(t => {
      t.style.height = 'auto';
      t.style.height = t.scrollHeight + 'px';
    });
  }

  // ====================
  // Load Data from Firestore
  // ====================
  async loadData() {
    if (!this.userId) return;
    const data = await this.expService.getExperience(this.userId);
    if (!data) return;

    this.experiences.clear();
    (data['experiences'] || []).forEach((e: any) => this.experiences.push(this.fb.group(e)));

    this.skills.clear();
    (data['skills'] || []).forEach((s: any) => this.skills.push(this.fb.control(s)));

    this.education.clear();
    (data['education'] || []).forEach((ed: any) => this.education.push(this.fb.group(ed)));

    this.certifications.clear();
    (data['certifications'] || []).forEach((c: any) => this.certifications.push(this.fb.control(c)));
    this.savedCerts = data['certifications'] || [];
      this.certPreviews = [];
  }

  // ====================
  // Experience Methods
  // ====================
  addExperience() {
    const g = this.form.get('experienceInput') as FormGroup;
    if (g.invalid) { g.markAllAsTouched(); return; }

    this.experiences.push(this.fb.group(g.value));
    g.reset();

    setTimeout(() => {
      this.cacheTextareaElements();
      this.autoResize();
    }, 0);
  }

  removeExperience(i: number) { this.experiences.removeAt(i); }

  // ====================
  // Skills Methods
  // ====================
  addSkill() {
    const val = this.form.value.skillInput?.trim();
    if (!val) return;
    if (!this.skills.value.includes(val)) this.skills.push(this.fb.control(val));
    this.form.patchValue({ skillInput: '' });
  }

  removeSkill(i: number) { this.skills.removeAt(i); }

  // ====================
  // Education Methods
  // ====================
  addEducation() {
    const g = this.form.get('educationInput') as FormGroup;
    if (g.invalid) { g.markAllAsTouched(); return; }

    this.education.push(this.fb.group(g.value));
    g.reset();

    setTimeout(() => {
      this.cacheTextareaElements();
      this.autoResize();
    }, 0);
  }

  removeEducation(i: number) { this.education.removeAt(i); }

  // ====================
  // Certifications Methods
  // ====================
  onCertSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || this.certFiles.length + this.savedCerts.length >= 4) return;

    this.certFiles.push(file);

    const reader = new FileReader();
    reader.onload = () => this.certPreviews.push(reader.result as string);
    reader.readAsDataURL(file);

    try { input.value = ''; } catch {}
  }

  removeCertPreview(i: number) {
    this.certFiles.splice(i, 1);
    this.certPreviews.splice(i, 1);
  }

  async removeSavedCert(i: number) {
    const url = this.savedCerts[i];
    if (!url) return;

    this.uiService.showLoader();
    try {
      await this.expService.deleteFileByUrl(url);
      this.savedCerts.splice(i, 1);
      this.certifications.removeAt(i);
      this.uiService.hideLoader();
    } catch (err) {
      console.error(err);
      this.uiService.hideLoader();
      alert('Failed to delete certification');
    }
  }

  // ====================
  // Save All Data
  // ====================
  async save() {
    if (!this.userId || !this.canSave) return alert('Please complete all required fields');

    this.uiService.showLoader();

    try {
      const certUrls: string[] = [];
      for (const file of this.certFiles) {
        const url = await this.expService.uploadCertificationFile(file, this.userId);
        certUrls.push(url);
      }

      const data = {
        experiences: this.experiences.value,
        skills: this.skills.value,
        education: this.education.value,
        certifications: [...this.savedCerts, ...certUrls]
      };

      await this.expService.saveExperience(this.userId, data);
      await this.dataCheck.checkAllData(this.userId);
      this.certFiles = [];
      this.certPreviews = [];
      this.certifications.clear();
      data.certifications.forEach(c => this.certifications.push(this.fb.control(c)));
      this.savedCerts = data.certifications;

      this.uiService.hideLoader();
      this.uiService.showSuccess();

    } catch (err) {
      console.error(err);
      this.uiService.hideLoader();
      alert('Error saving data');
    }
  }

  // ====================
  // Cleanup
  // ====================
 ngOnDestroy() {
  // Unsubscribe from all subscriptions to prevent memory leaks
  this.subs.unsubscribe();

  // Clear timeout for textarea auto-resize if exists
  if (this.resizeTimeout) clearTimeout(this.resizeTimeout);

  // Clear temporary certificate files and previews
  this.certFiles = [];
  this.certPreviews = [];
  this.savedCerts = [];

  // Clear all FormArrays to reset form state
  try { 
    this.experiences.clear(); 
    this.skills.clear(); 
    this.education.clear(); 
    this.certifications.clear(); 
  } catch {}

  // Reset the main form
  try { this.form.reset(); } catch {}

  // Remove stored user ID
  this.userId = null;

  // Optional: clear cached textarea elements
  this.textareaElements = [];
}

}
