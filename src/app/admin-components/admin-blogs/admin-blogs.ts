import { Component, OnInit, AfterViewInit, OnDestroy, ViewChildren, QueryList, ElementRef, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AdminBlogsService } from '../../services/admin-blogs.service';
import { AuthService } from '../../services/auth';
import { UiService } from '../../services/ui.service';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-admin-blogs',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, DragDropModule],
  templateUrl: './admin-blogs.html',
  styleUrls: ['./admin-blogs.scss']
})
export class AdminBlogs implements OnInit, AfterViewInit, OnDestroy {

  form!: FormGroup;
  blogs: any[] = [];
  userId: string | null = null;

  private destroy$ = new Subject<void>();

  @ViewChildren('autoResizeTextArea') textareas!: QueryList<ElementRef>;

  imageFile: File | null = null;
  imagePreview: string | null = null;
  editIndex: number | null = null;

  constructor(
    private fb: FormBuilder,
    private blogService: AdminBlogsService,
    private auth: AuthService,
    private ui: UiService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      blogTitle: ['', Validators.required],
      blogSubtitle: ['', Validators.required],
      blogDescription: ['', [Validators.required, this.wordCountValidator(30, 200)]],
      paragraph1: [''],
      paragraph2: [''],
      blogImage: [null, Validators.required]
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

  onImageSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.imageFile = file;

    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
      this.form.patchValue({ blogImage: true });
    };
    reader.readAsDataURL(file);
  }

  ngAfterViewInit() {
    setTimeout(() => this.autoResizeAll(), 0);
  }

  ngOnDestroy() {
    // ------------------------
    // 1. Complete all subscriptions
    // ------------------------
    this.destroy$.next();
    this.destroy$.complete();

    // ------------------------
    // 2. Reset form and all reactive controls
    // ------------------------
    try {
      if (this.form) {
        this.form.reset();
        (Object.keys(this.form.controls) || []).forEach(key => {
          const ctrl = this.form.get(key);
          if (ctrl instanceof FormArray) ctrl.clear();
        });
      }
    } catch {}

    // ------------------------
    // 3. Clear blogs and image refs
    // ------------------------
    this.blogs = [];
    this.imageFile = null;
    this.imagePreview = null;
    this.editIndex = null;

    // ------------------------
    // 4. Clean up textareas
    // ------------------------
    this.textareas?.forEach(t => {
      try {
        t.nativeElement.style.height = '';
      } catch {}
    });
  }

  wordCountValidator(min: number, max: number) {
    return (control: AbstractControl) => {
      if (!control.value) return { required: true };
      const count = control.value.trim().split(/\s+/).length;
      if (count < min) return { minWords: count };
      if (count > max) return { maxWords: count };
      return null;
    };
  }

  // ------------------ Drag & Drop ------------------
 async drop(event: CdkDragDrop<any>) {
  moveItemInArray(this.blogs, event.previousIndex, event.currentIndex);
  if (!this.userId) return;
  try {
    await this.blogService.updateBlogs(this.userId, this.blogs);
  } catch (err) {
    console.error('Error saving order', err);
  }
}

  autoResize(event: Event) {
    const el = event.target as HTMLTextAreaElement;
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  }

  autoResizeAll() {
    this.textareas?.forEach(t => {
      const el = t.nativeElement;
      el.style.height = 'auto';
      el.style.height = el.scrollHeight + 'px';
    });
  }

  // ==============================
  // ADD NEW BLOG 
  // ==============================
  async addBlog() {
    if (this.form.invalid || !this.userId) return;

    this.ui.showLoader();

    let imageUrl = this.imagePreview || '';

    if (this.imageFile) {
      if (this.editIndex !== null && this.blogs[this.editIndex]?.image) {
        await this.blogService.deleteImage(this.blogs[this.editIndex].image);
      }

      const path = `blogs/${this.userId}/${Date.now()}-${this.imageFile.name}`;
      imageUrl = await this.blogService.uploadImage(this.imageFile, path);
    }

    const id = this.editIndex !== null
      ? this.blogs[this.editIndex].id  
      : crypto.randomUUID();

    const blog = {
      id,
      title: this.form.value.blogTitle,
      subtitle: this.form.value.blogSubtitle,
      description: this.form.value.blogDescription,
      paragraph1: this.form.value.paragraph1 || '',
      paragraph2: this.form.value.paragraph2 || '',
      image: imageUrl
    };

    try {
      const data = await this.blogService.getBlogs(this.userId);
      const oldBlogs = data?.['blogs'] || [];
      let updatedBlogs;

      if (this.editIndex !== null) {
        updatedBlogs = [...oldBlogs];
        updatedBlogs[this.editIndex] = blog;
        this.editIndex = null;
      } else {
        updatedBlogs = [...oldBlogs, blog];
      }

      await this.blogService.updateBlogs(this.userId, updatedBlogs);

      this.blogs = updatedBlogs;

      this.ui.hideLoader();
      this.ui.showSuccess();

      this.form.reset();
      this.imageFile = null;
      this.imagePreview = null;

    } catch (err) {
      console.error(err);
      this.ui.hideLoader();
      alert('Error saving blog');
    }
  }

  editBlog(i: number) {
    const blog = this.blogs[i];
    this.editIndex = i;

    this.form.patchValue({
      blogTitle: blog.title,
      blogSubtitle: blog.subtitle,
      blogDescription: blog.description,
      paragraph1: blog.paragraph1,
      paragraph2: blog.paragraph2,
      blogImage: !!blog.image
    });

    this.imagePreview = blog.image || null;
    this.imageFile = null; 
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => this.autoResizeAll(), 0);
  }

  // ==============================
  // LOAD BLOGS
  // ==============================
  async loadData() {
    if (!this.userId) return;
    const data = await this.blogService.getBlogs(this.userId);
    this.blogs = data?.['blogs'] || [];
    setTimeout(() => this.autoResizeAll(), 0);
  }

  // ==============================
  // REMOVE BLOG
  // ==============================
  async removeBlog(i: number) {
    const blog = this.blogs[i];

    if (blog.image) {
      await this.blogService.deleteImage(blog.image);
    }

    this.blogs.splice(i, 1);

    if (this.userId) {
      await this.blogService.updateBlogs(this.userId, this.blogs);
    }
  }
}
