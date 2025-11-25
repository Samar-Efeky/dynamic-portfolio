import { CommonModule } from '@angular/common';
import { Component, OnInit, AfterViewInit, OnDestroy, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AdminBlogsService } from '../../services/admin-blogs.service';
import { AuthService } from '../../services/auth';
import { UiService } from '../../services/ui.service';

@Component({
  selector: 'app-admin-blogs',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-blogs.html',
  styleUrl: './admin-blogs.scss'
})
export class AdminBlogs implements OnInit, AfterViewInit, OnDestroy {

  form!: FormGroup;
  blogs!: FormArray;
  userId: string | null = null;

  private destroy$ = new Subject<void>();

  @ViewChildren('autoResizeTextArea') textareas!: QueryList<ElementRef<HTMLTextAreaElement>>;

  constructor(
    private fb: FormBuilder,
    private blogService: AdminBlogsService,
    private auth: AuthService,
    private ui: UiService
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      blogTitle: ['', Validators.required],
      blogSubtitle: ['', Validators.required],
      blogDescription: ['', [Validators.required, this.wordCountValidator(15, 25)]]
    });

    this.blogs = this.fb.array([]);

    // اشتراك آمن مع takeUntil
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
    setTimeout(() => this.autoResizeAll(), 0);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();

    this.form.reset();
    this.blogs.clear();
  }

  wordCountValidator(min: number, max: number) {
    return (control: AbstractControl) => {
      if (!control.value || !control.value.trim()) return { required: true };
      const wc = control.value.trim().split(/\s+/).length;
      if (wc < min) return { minWords: wc };
      if (wc > max) return { maxWords: wc };
      return null;
    };
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

  addBlog() {
    if (this.form.invalid) return;

    this.blogs.push(
      this.fb.group({
        title: this.form.value.blogTitle,
        subtitle: this.form.value.blogSubtitle,
        description: this.form.value.blogDescription
      })
    );

    this.form.reset();
    setTimeout(() => this.autoResizeAll(), 50);
  }

  removeBlog(i: number) {
    this.blogs.removeAt(i);
  }

  async loadData() {
    if (!this.userId) return;

    const data = await this.blogService.getBlogs(this.userId);
    if (!data) return;

    (data['blogs'] || []).forEach((b: any) => {
      this.blogs.push(
        this.fb.group({
          title: b.title,
          subtitle: b.subtitle,
          description: b.description
        })
      );
    });

    setTimeout(() => this.autoResizeAll(), 50);
  }

  getPayload() {
    return { blogs: this.blogs.value };
  }

  async saveData() {
    if (!this.userId || this.blogs.length === 0) return;

    this.ui.showLoader();
    try {
      await this.blogService.saveBlogs(this.userId, this.getPayload());
      this.ui.hideLoader();
      this.ui.showSuccess();
    } catch (err) {
      this.ui.hideLoader();
      console.error(err);
      alert('Error saving data');
    }
  }

  canSave() {
    return this.blogs.length > 0;
  }
}
