import { CommonModule } from '@angular/common';
import { Component, OnInit, AfterViewInit, OnDestroy, ViewChildren, QueryList, ElementRef, Inject, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AdminTestimonialsService } from '../../services/admin-testimonials.service';
import { AuthService } from '../../services/auth';
import { UiService } from '../../services/ui.service';
import { AdminDataCheckService } from '../../services/admin-data-check';

@Component({
  selector: 'app-admin-testimonials',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-testimonials.html',
  styleUrl: './admin-testimonials.scss'
})
export class AdminTestimonials implements OnInit, AfterViewInit, OnDestroy {

  // ========================
  // FORM & DATA
  // ========================
  form!: FormGroup;
  userId: string | null = null;
  testimonials: any[] = [];
  clientImage: string | null = null;

  // ========================
  // CLEANUP
  // ========================
  private destroy$ = new Subject<void>();

  // ========================
  // AUTO-RESIZE TEXTAREAS
  // ========================
  @ViewChildren('autoResizeTextArea') textareas!: QueryList<ElementRef<HTMLTextAreaElement>>;

  constructor(
    private fb: FormBuilder,
    private service: AdminTestimonialsService,
    private auth: AuthService,
    private ui: UiService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private dataCheck: AdminDataCheckService
  ) {}

  // ========================
  // INIT
  // ========================
  ngOnInit() {
    this.initForm();

    // Subscribe to current user and load testimonials
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

  // ========================
  // DESTROY / CLEANUP
  // ========================
  ngOnDestroy() {
    // Complete all subscriptions
    this.destroy$.next();
    this.destroy$.complete();

    // Clear form and data
    this.form.reset();
    this.testimonials = [];
    this.clientImage = null;
  }

  // ========================
  // FORM INITIALIZATION
  // ========================
  private initForm() {
    this.form = this.fb.group({
      clientName: ['', Validators.required],
      clientTitle: ['', Validators.required],
      clientDescription: ['', [Validators.required, this.wordCountValidator(15, 40)]]
    });
  }

  // ========================
  // WORD COUNT VALIDATOR
  // ========================
  private wordCountValidator(min: number, max: number) {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value || !control.value.trim()) return { required: true };
      const wc = control.value.trim().split(/\s+/).length;
      if (wc < min) return { minWords: wc };
      if (wc > max) return { maxWords: wc };
      return null;
    };
  }

  // ========================
  // LOAD EXISTING TESTIMONIALS
  // ========================
  async loadData() {
    if (!this.userId) return;
    const data = await this.service.getTestimonials(this.userId);
    if (data?.['testimonials']) {
      this.testimonials = data['testimonials'];
    }
    setTimeout(() => this.autoResizeAll(), 50);
  }

  // ========================
  // IMAGE HANDLING
  // ========================
  uploadImage(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => this.clientImage = reader.result as string;
    reader.readAsDataURL(file);
  }

  removeImage() {
    this.clientImage = null;
  }

  // ========================
  // ADD TESTIMONIAL
  // ========================
  async addTestimonial() {
    if (this.form.invalid || !this.clientImage || !this.userId) return;

    this.ui.showLoader();

    try {
      let imageUrl: string;

      // Check if new file is selected
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = fileInput?.files?.[0];
      if (file) {
        imageUrl = await this.service.uploadImage(file, this.userId);
      } else {
        imageUrl = this.clientImage; // Use existing image URL
      }

      const testimonial = {
        id: crypto.randomUUID(),
        name: this.form.value.clientName,
        title: this.form.value.clientTitle,
        description: this.form.value.clientDescription,
        image: imageUrl
      };

      this.testimonials.push(testimonial);

      // Save testimonials to Firestore
      await this.service.saveTestimonials(this.userId, { testimonials: this.testimonials });

      // Reset form
      this.form.reset();
      this.clientImage = null;
      setTimeout(() => this.autoResizeAll(), 50);

      this.ui.hideLoader();
      this.ui.showSuccess();

    } catch (err) {
      console.error(err);
      this.ui.hideLoader();
      alert('Error saving testimonial');
    }
  }

  // ========================
  // REMOVE TESTIMONIAL
  // ========================
  async removeTestimonial(i: number) {
    if (!this.userId) return;

    const testimonial = this.testimonials[i];

    // Delete image from storage
    if (testimonial?.image) {
      await this.service.deleteImage(testimonial.image);
    }

    // Remove from array and save
    this.testimonials.splice(i, 1);
    await this.service.saveTestimonials(this.userId, { testimonials: this.testimonials });
  }

  // ========================
  // UTILITIES
  // ========================
  getPayload() {
    return { testimonials: this.testimonials };
  }

  // Auto-resize single textarea
  autoResize(event: Event) {
    const el = event.target as HTMLTextAreaElement;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  }

  // Auto-resize all textareas
  autoResizeAll() {
    this.textareas?.forEach(a => {
      const t = a.nativeElement;
      t.style.height = "auto";
      t.style.height = t.scrollHeight + "px";
    });
  }

  // Word count for template display
  wordCount() {
    const v = this.form.get('clientDescription')?.value || '';
    return v.trim() ? v.trim().split(/\s+/).length : 0;
  }
}
