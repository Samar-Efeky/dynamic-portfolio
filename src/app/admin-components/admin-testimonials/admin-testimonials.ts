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

  form!: FormGroup;
  userId: string | null = null;
  testimonials: any[] = [];
  clientImage: string | null = null;

  private destroy$ = new Subject<void>();

  @ViewChildren('autoResizeTextArea') textareas!: QueryList<ElementRef<HTMLTextAreaElement>>;

  constructor(
    private fb: FormBuilder,
    private service: AdminTestimonialsService,
    private auth: AuthService,
    private ui: UiService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private dataCheck: AdminDataCheckService
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      clientName: ['', Validators.required],
      clientTitle: ['', Validators.required],
      clientDescription: ['', [Validators.required, this.wordCountValidator(15, 25)]]
    });

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
    this.destroy$.next();
    this.destroy$.complete();
    this.form.reset();
    this.testimonials = [];
    this.clientImage = null;
  }

  wordCountValidator(min: number, max: number) {
    return (c: AbstractControl): ValidationErrors | null => {
      if (!c.value || !c.value.trim()) return { required: true };
      const wc = c.value.trim().split(/\s+/).length;
      if (wc < min) return { minWords: wc };
      if (wc > max) return { maxWords: wc };
      return null;
    };
  }

  async loadData() {
    if (!this.userId) return;
    const data = await this.service.getTestimonials(this.userId);
    if (data && data['testimonials']) {
      this.testimonials = data['testimonials'];
    }
    setTimeout(() => this.autoResizeAll(), 50);
  }

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

  addTestimonial() {
    if (this.form.invalid || !this.clientImage) return;

    this.testimonials.push({
      name: this.form.value.clientName,
      title: this.form.value.clientTitle,
      description: this.form.value.clientDescription,
      image: this.clientImage
    });

    this.form.reset();
    this.clientImage = null;
    setTimeout(() => this.autoResizeAll(), 50);
  }

  removeTestimonial(i: number) {
    this.testimonials.splice(i, 1);
  }

  getPayload() {
    return { testimonials: this.testimonials };
  }

  async save() {
    if (!this.userId || this.testimonials.length === 0) return;

    this.ui.showLoader();
    try {
      await this.service.saveTestimonials(this.userId, this.getPayload());
      await this.dataCheck.checkAllData(this.userId);
      this.ui.hideLoader();
      this.ui.showSuccess();
    } catch (err) {
      this.ui.hideLoader();
      console.error(err);
      alert("Error saving data");
    }
  }

  autoResize(event: Event) {
    const el = event.target as HTMLTextAreaElement;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  }

  autoResizeAll() {
    this.textareas?.forEach(a => {
      const t = a.nativeElement;
      t.style.height = "auto";
      t.style.height = t.scrollHeight + "px";
    });
  }

  canSave() {
    return this.testimonials.length > 0;
  }

  wordCount() {
    const v = this.form.get('clientDescription')?.value || '';
    return v.trim() ? v.trim().split(/\s+/).length : 0;
  }
}
