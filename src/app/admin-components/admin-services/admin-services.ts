import { CommonModule } from '@angular/common';
import { Component, OnInit, AfterViewInit, OnDestroy, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AdminServicesService } from '../../services/admin-services.service';
import { AuthService } from '../../services/auth';
import { UiService } from '../../services/ui.service';
import { AdminDataCheckService } from '../../services/admin-data-check';

@Component({
  selector: 'app-admin-services',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-services.html',
  styleUrl: './admin-services.scss'
})
export class AdminServices implements OnInit, AfterViewInit, OnDestroy {

  form!: FormGroup;
  featureControl = new FormControl('', Validators.required);

  features: string[] = [];
  services: any[] = [];

  userId: string | null = null;

  private destroy$ = new Subject<void>();

  @ViewChildren('autoResizeTextArea') textareas!: QueryList<ElementRef<HTMLTextAreaElement>>;

  constructor(
    private fb: FormBuilder,
    private serviceDB: AdminServicesService,
    private auth: AuthService,
    private uiService: UiService,
    private dataCheck: AdminDataCheckService
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      serviceTitle: ['', Validators.required],
      serviceDescription: ['', [Validators.required, this.wordCountValidator(15, 25)]]
    });

    this.auth.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(async (user) => {
        if (user) {
          this.userId = user.uid;
          await this.loadData();
        }
      });
  }

  ngAfterViewInit() {
    setTimeout(() => this.autoResizeAll(), 100);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();

    this.form.reset();
    this.features = [];
    this.services = [];
  }

  // ================= Validators =================
  wordCountValidator(min: number, max: number) {
    return (c: AbstractControl): ValidationErrors | null => {
      if (!c.value || !c.value.trim()) return { required: true };
      const words = c.value.trim().split(/\s+/).length;
      if (words < min) return { minWords: words };
      if (words > max) return { maxWords: words };
      return null;
    };
  }

  // ================= Load Data =================
  async loadData() {
    if (!this.userId) return;

    const data = await this.serviceDB.getServices(this.userId);
    if (!data) return;

    this.services = data['services'] || [];

    setTimeout(() => this.autoResizeAll(), 50);
  }

  // ================= Features =================
  addFeature() {
    const v = this.featureControl.value?.trim();
    if (!v) return;
    if (this.features.length >= 2) return;

    if (!this.features.some(f => f.toLowerCase() === v.toLowerCase())) {
      this.features.push(v);
    }
    this.featureControl.setValue('');
  }

  removeFeature(i: number) {
    this.features.splice(i, 1);
  }

  // ================= Services =================
  addService() {
    if (this.form.invalid || this.features.length !== 2) return;

    this.services.push({
      title: this.form.value.serviceTitle,
      description: this.form.value.serviceDescription,
      features: [...this.features]
    });

    this.form.reset();
    this.features = [];

    setTimeout(() => this.autoResizeAll(), 50);
  }

  removeService(i: number) {
    this.services.splice(i, 1);
  }

  async saveData() {
    if (!this.userId || this.services.length === 0) return;

    this.uiService.showLoader();
    try {
      await this.serviceDB.saveServices(this.userId, { services: this.services });
      await this.dataCheck.checkAllData(this.userId);
      this.uiService.hideLoader();
      this.uiService.showSuccess();
    } catch (err) {
      this.uiService.hideLoader();
      console.error(err);
      alert("Error while saving services");
    }
  }

  canSave() {
    return this.services.length > 0;
  }

  wordCount() {
    const v = this.form.get('serviceDescription')?.value || '';
    return v.trim() ? v.trim().split(/\s+/).length : 0;
  }

  // ================= Auto Resize =================
  autoResize(e: Event) {
    const t = e.target as HTMLTextAreaElement;
    t.style.height = 'auto';
    t.style.height = t.scrollHeight + 'px';
  }

  autoResizeAll() {
    this.textareas?.forEach(a => {
      const t = a.nativeElement;
      t.style.height = 'auto';
      t.style.height = t.scrollHeight + 'px';
    });
  }
}
