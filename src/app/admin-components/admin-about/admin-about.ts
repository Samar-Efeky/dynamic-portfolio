import {
  CommonModule
} from '@angular/common';
import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormControl,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
import { AdminAboutService } from '../../services/admin-about.service';
import { AuthService } from '../../services/auth';
import { UiService } from '../../services/ui.service';
import { Subscription } from 'rxjs';
import { AdminDataCheckService } from '../../services/admin-data-check';

@Component({
  selector: 'app-admin-about',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-about.html',
  styleUrl: './admin-about.scss'
})
export class AdminAbout implements OnInit, AfterViewInit, OnDestroy {

  form!: FormGroup;
  inspiringWordControl!: FormControl;
  inspiringWords: string[] = [];
  userId: string | null = null;

  // ================================
  // Cleanup Helpers
  // ================================
  private subs = new Subscription();
  private resizeTimeout: any;
  private textareaElements: HTMLTextAreaElement[] = [];

  constructor(
    private fb: FormBuilder,
    private aboutService: AdminAboutService,
    private auth: AuthService,
    private uiService: UiService,
    private dataCheck: AdminDataCheckService
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      mainDescription: ['', [Validators.required, this.wordCountValidator(30, 100)]],
      howIGotHere: ['', [Validators.required, this.wordCountValidator(30, 100)]],
      additional1: ['', [Validators.required, this.wordCountValidator(30, 100)]],
      additional2: ['', [Validators.required, this.wordCountValidator(30, 100)]]
    });

    this.inspiringWordControl = new FormControl('', [
      Validators.required,
      Validators.minLength(2)
    ]);

    // ================================
    // IMPORTANT: store subscription
    // ================================
    const sub = this.auth.currentUser$.subscribe(async (user) => {
      if (user) {
        this.userId = user.uid;
        await this.loadData();
      }
    });

    this.subs.add(sub);
  }

  ngAfterViewInit() {
    // Resize after view init
    this.resizeTimeout = setTimeout(() => this.autoResizeAll(), 0);
  }

  // ================================
  //   Word Count Validator
  // ================================
  wordCountValidator(min: number, max: number) {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value || !control.value.trim()) return { required: true };
      const wc = control.value.trim().split(/\s+/).length;
      if (wc < min) return { minWords: wc };
      if (wc > max) return { maxWords: wc };
      return null;
    };
  }

  async loadData() {
    if (!this.userId) return;

    const data = await this.aboutService.getAbout(this.userId);
    if (!data) return;

    this.inspiringWords = data['inspiringWords'] || [];

    this.form.patchValue({
      mainDescription: data['mainDescription'] || '',
      howIGotHere: data['howIGotHere'] || '',
      additional1: data['additionalDescription']?.paragraph1 || '',
      additional2: data['additionalDescription']?.paragraph2 || ''
    });

    // Resize textareas
    this.resizeTimeout = setTimeout(() => this.autoResizeAll(), 50);
  }

  // ================================
  //     Inspiring Words
  // ================================
  addInspiringWord() {
    const w = this.inspiringWordControl.value?.trim();
    if (!w || this.inspiringWords.length >= 4) return;

    if (!this.inspiringWords.some(x => x.toLowerCase() === w.toLowerCase())) {
      this.inspiringWords.push(w);
    }

    this.inspiringWordControl.setValue('');
  }

  removeInspiringWord(i: number) {
    this.inspiringWords.splice(i, 1);
  }

  // ================================
  //         Payload
  // ================================
  getPayload() {
    return {
      inspiringWords: this.inspiringWords,
      mainDescription: this.form.value.mainDescription,
      howIGotHere: this.form.value.howIGotHere,
      additionalDescription: {
        paragraph1: this.form.value.additional1,
        paragraph2: this.form.value.additional2
      }
    };
  }

  async save() {
    if (!this.userId || this.form.invalid || this.inspiringWords.length < 2) return;

    this.uiService.showLoader();
    try {
      await this.aboutService.saveAbout(this.userId, this.getPayload());
      await this.dataCheck.checkAllData(this.userId); 
      this.uiService.hideLoader();
      this.uiService.showSuccess();
    } catch (err) {
      this.uiService.hideLoader();
      console.error(err);
      alert('An error occurred while saving data.');
    }
  }

  canSave() {
    return this.form.valid &&
      this.inspiringWords.length >= 2 &&
      this.inspiringWords.length <= 4;
  }

  wordCount(c: string) {
    const v = this.form.get(c)?.value || '';
    return v.trim() ? v.trim().split(/\s+/).length : 0;
  }

  // ================================
  //         Auto Resize
  // ================================
  autoResize(event: Event) {
    const el = event.target as HTMLTextAreaElement;
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  }

  autoResizeAll() {
    this.textareaElements =
      Array.from(document.querySelectorAll('textarea')) as HTMLTextAreaElement[];

    this.textareaElements.forEach(ta => {
      ta.style.overflow = 'hidden';
      ta.style.height = 'auto';
      ta.style.height = ta.scrollHeight + 'px';
    });
  }

  // ================================
  //       Cleanup on Destroy
  // ================================
  ngOnDestroy() {

    // 1. Cancel all subscriptions
    this.subs.unsubscribe();

    // 2. Clear timeout
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }

    // 3. Remove textarea references
    this.textareaElements = [];

    // 4. Reset form
    this.form.reset();

    // 5. Reset inspiring words
    this.inspiringWords = [];

    // 6. Clear control
    this.inspiringWordControl.reset();
  }
}
