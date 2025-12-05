import {
  Component,
  OnInit,
  OnDestroy,
  Inject,
  PLATFORM_ID
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
  AsyncValidatorFn
} from '@angular/forms';
import { AdminInfoService } from '../../services/admin-info.service';
import { AuthService } from '../../services/auth';
import { UiService } from '../../services/ui.service';
import { Subscription } from 'rxjs';
import { AdminDataCheckService } from '../../services/admin-data-check';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';

// ================================
//        Custom Validators
// ================================
export function usernameUniqueValidator(adminService: AdminInfoService, currentUid?: string): AsyncValidatorFn {
  return async (control: AbstractControl) => {
    const username = control.value?.trim();
    if (!username) return null;

    const data = await adminService.getAdminInfoByUsername(username);
    if (!data) return null;
    if (data.uid === currentUid) return null;
    return { usernameTaken: true };
  };
}

export function minLengthArray(min: number) {
  return (control: AbstractControl): ValidationErrors | null => {
    const arr = control as FormArray;
    return arr.length >= min ? null : { minLengthArray: true };
  };
}

export function maxLengthArray(max: number) {
  return (control: AbstractControl): ValidationErrors | null => {
    const arr = control as FormArray;
    return arr.length <= max ? null : { maxLengthArray: true };
  };
}

// ================================
//        Component
// ================================
@Component({
  selector: 'app-admin-info',
  standalone: true,
  imports: [ReactiveFormsModule, DragDropModule, CommonModule],
  templateUrl: './admin-info.html',
  styleUrls: ['./admin-info.scss']
})
export class AdminInfo implements OnInit, OnDestroy {
  form!: FormGroup;
  uid: any | null = null;

  urlPlaceholder: string = 'Platform URL (e.g. https://example.com/...)';
  profileImagePreview: string | ArrayBuffer | null = null;
  logoImagePreview: string | ArrayBuffer | null = null;

  videoFile: File | null = null;
  videoPreview: string | null = null;
  videoProgress: number = 0;
  videoUploadSub: Subscription | null = null;
  videoError: string = '';

  private subs = new Subscription(); // Holds all subscriptions
  private fileReader: FileReader | null = null;
  private profileImageFile: File | null = null;
  private logoImageFile: File | null = null;
  private resizeTimeout: any;
  private textareaElements: HTMLTextAreaElement[] = [];

  currentUsername: string = '';
  socialError: string = '';

  constructor(
    private fb: FormBuilder,
    private adminService: AdminInfoService,
    private authService: AuthService,
    public uiService: UiService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private dataCheck: AdminDataCheckService
  ) {}

  ngOnInit() {
    this.uid = this.authService.getUidFromStorage();

    // Initialize the form
    this.form = this.fb.group({
      fullName: ['', Validators.required],
      username: ['', [Validators.required, Validators.pattern(/^\S+$/)], [usernameUniqueValidator(this.adminService, this.uid)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      address: ['', Validators.required],
      mainJobTitle: ['', Validators.required],
      buttonInHeroSection:[''],
      socialLinks: this.fb.array([]),
      profileImage: ['', Validators.required],
      profileImagePath: [''],
      logoImage: ['', Validators.required],
      logoImagePath: [''],
      introVideo: [''],
      introVideoPath: [''],
      publicDescription: ['', Validators.required],
    });

    if (this.uid) this.loadData();

    // Auto resize all textareas after render
    this.resizeTimeout = setTimeout(() => this.autoResizeAll(), 0);
  }

  // ================================ FormArray Getter ================================
  get socialLinksArray(): FormArray {
    return this.form.get('socialLinks') as FormArray;
  }

  // ================================ Social Links ================================
  addSocial(platform: string, url: string) {
    platform = platform.trim();
    url = url.trim();
    this.socialError = '';

    if (!platform || !url) {
      this.socialError = 'Please fill both Platform Name and URL.';
      return;
    }

    const exists = this.socialLinksArray.controls.some(
      (s: any) => s.value.platform.toLowerCase() === platform.toLowerCase()
    );

    if (exists) {
      this.socialError = `${platform} is already added!`;
      return;
    }

    this.socialLinksArray.push(
      this.fb.group({
        platform: [platform, Validators.required],
        url: [url, Validators.required]
      })
    );
  }

  removeSocial(index: number) {
    this.socialLinksArray.removeAt(index);
  }

  updateUrlPlaceholder(platform: string) {
    const p = platform.trim().toLowerCase();
    this.urlPlaceholder = p ? `https://${p}.com/your-profile` : 'Platform URL (e.g. https://example.com/...)';
  }

  getPlatformIcon(platform: string) {
    if (!platform) return '';
    const p = platform.trim().toLowerCase();
    const knownPlatforms = ['linkedin','facebook','twitter','instagram','github','youtube','tiktok','behance','dribbble'];
    return knownPlatforms.includes(p) ? `<i class="fab fa-${p} span-color"></i>` : `<i class="fa-solid fa-earth-americas span-color"></i>`;
  }

  drop(event: CdkDragDrop<any>) {
    moveItemInArray(this.socialLinksArray.controls, event.previousIndex, event.currentIndex);
    this.socialLinksArray.updateValueAndValidity();
  }

  // ================================ Upload Images ================================
  async uploadImage(event: Event, type: 'profile' | 'logo') {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    this.fileReader = reader; // keep reference for cleanup

    reader.onload = () => {
      if (type === 'profile') {
        this.profileImagePreview = reader.result;
        this.profileImageFile = file;
        this.form.patchValue({ profileImage: reader.result });
      } else {
        this.logoImagePreview = reader.result;
        this.logoImageFile = file;
        this.form.patchValue({ logoImage: reader.result });
      }
    };
    reader.readAsDataURL(file);
  }

  // ================================ Upload Video ================================
  async uploadVideo(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.videoError = '';
    this.videoFile = file;
    this.videoPreview = null;
    this.videoProgress = 0;

    const validTypes = ['video/mp4','video/webm','video/ogg','video/quicktime','video/x-m4v'];
    if (!validTypes.includes(file.type)) { this.videoError = 'Only video files are allowed'; return; }
    if (file.size > 30 * 1024 * 1024) { this.videoError = 'Maximum allowed size is 30MB'; return; }

    const reader = new FileReader();
    this.fileReader = reader;
    reader.onload = () => this.videoPreview = reader.result as string;
    reader.readAsDataURL(file);

    if (!this.uid) return;

    try {
      if (this.form.value.introVideoPath) {
        await this.adminService.deleteVideoFileByPath(this.form.value.introVideoPath);
      }

      const { progress, downloadURL, storagePath } = this.adminService.uploadVideoFileWithProgress(file, this.uid, 'introVideo');

      this.videoUploadSub?.unsubscribe();
      this.videoUploadSub = progress.subscribe({
        next: (p) => this.videoProgress = p,
        error: (err) => { this.videoError = 'Error uploading video'; console.error(err); }
      });

      const url = await downloadURL;
      this.form.patchValue({ introVideo: url, introVideoPath: storagePath });
      await this.adminService.saveAdminInfo(this.uid, { introVideo: url, introVideoPath: storagePath });

    } catch (err) {
      this.videoError = 'Error uploading video';
      console.error(err);
    }
  }

  async removeVideo() {
    if (!this.uid || !this.form.value.introVideoPath) return;

    try {
      await this.adminService.deleteVideoFileByPath(this.form.value.introVideoPath);
      this.form.patchValue({ introVideo: '', introVideoPath: '', introVideoStoragePath: '' });
      this.videoPreview = null;
      this.videoFile = null;
      this.videoProgress = 0;
      this.videoUploadSub?.unsubscribe();
    } catch (err) {
      console.error('Error deleting video', err);
    }
  }

  // ================================ Save Data ================================
  async saveData() {
    if (!this.uid || this.form.invalid) return;

    this.uiService.showLoader();

    try {
      // ===== Profile Image =====
      if (this.profileImageFile) {
        const oldPath = this.form.value.profileImagePath;
        if (oldPath) await this.adminService.deleteFileByPath(oldPath);

        const { downloadURL, storagePath } = await this.adminService.uploadImageFileWithPath(this.profileImageFile, 'profile', this.uid);

        this.form.patchValue({ profileImage: downloadURL, profileImagePath: storagePath });
        this.profileImagePreview = downloadURL;
        this.profileImageFile = null;
      }

      // ===== Logo Image =====
      if (this.logoImageFile) {
        const oldPath = this.form.value.logoImagePath;
        if (oldPath) await this.adminService.deleteFileByPath(oldPath);

        const { downloadURL, storagePath } = await this.adminService.uploadImageFileWithPath(this.logoImageFile, 'logo', this.uid);

        this.form.patchValue({ logoImage: downloadURL, logoImagePath: storagePath });
        this.logoImagePreview = downloadURL;
        this.logoImageFile = null;
      }
        // ===== Ensure socialLinks is always an array =====
    const formData = { ...this.form.value };
    if (!formData.socialLinks) formData.socialLinks = [];

      // ===== Save all form data =====
      await this.adminService.saveAdminInfo(this.uid,formData);
      await this.dataCheck.checkAllData(this.uid);

      this.uiService.hideLoader();
      this.uiService.showSuccess();

    } catch (err) {
      console.error(err);
      this.uiService.hideLoader();
      alert('Error saving data');
    }
  }

  // ================================ Load Data ================================
  async loadData() {
    if (!this.uid) return;

    const data = await this.adminService.getAdminInfo(this.uid);
    if (!data) return;

    this.currentUsername = data['username'] || '';
    this.form.patchValue({
      fullName: data['fullName'],
      username: data['username'],
      email: data['email'],
      phone: data['phone'],
      address: data['address'],
      mainJobTitle: data['mainJobTitle'],
      buttonInHeroSection: data['buttonInHeroSection'] || '',
      profileImage: data['profileImage'] || '',
      profileImagePath: data['profileImagePath'] || '',
      publicDescription: data['publicDescription'] || '',
      logoImage: data['logoImage'] || '',
      logoImagePath: data['logoImagePath'] || '',
      introVideo: data['introVideo'] || '',
      introVideoPath: data['introVideoPath'] || ''
    });

    this.form.get('username')?.setAsyncValidators(usernameUniqueValidator(this.adminService, this.uid));
    this.form.get('username')?.updateValueAndValidity({ emitEvent: false });

    this.profileImagePreview = data['profileImage'] || null;
    this.logoImagePreview = data['logoImage'] || null;
    if (data['introVideo']) this.videoPreview = data['introVideo'];

    if (data['socialLinks']) {
      data['socialLinks'].forEach((s: any) => {
        this.socialLinksArray.push(this.fb.group({ platform: s.platform, url: s.url }));
      });
    }

    this.resizeTimeout = setTimeout(() => this.autoResizeAll(), 50);
  }

  // ================================ Auto Resize ================================
  autoResize(event: Event) {
    const el = event.target as HTMLTextAreaElement;
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  }

  autoResizeAll() {
    this.textareaElements = Array.from(document.querySelectorAll('textarea')) as HTMLTextAreaElement[];
    this.textareaElements.forEach(ta => {
      ta.style.overflow = 'hidden';
      ta.style.height = 'auto';
      ta.style.height = ta.scrollHeight + 'px';
    });
  }

  // ================================ Cleanup ================================
  ngOnDestroy() {
    // Unsubscribe from all subscriptions
    this.subs.unsubscribe();
    this.videoUploadSub?.unsubscribe();

    // Clear timeout
    if (this.resizeTimeout) clearTimeout(this.resizeTimeout);

    // Clear file reader
    if (this.fileReader) {
      this.fileReader.onload = null;
      this.fileReader.abort();
      this.fileReader = null;
    }

    // Clear textareas
    this.textareaElements = [];

    // Clear form and arrays
    this.socialLinksArray.clear();
    this.form.reset();

    // Clear images and video
    this.profileImagePreview = null;
    this.logoImagePreview = null;
    this.profileImageFile = null;
    this.logoImageFile = null;
    this.videoFile = null;
    this.videoPreview = null;
    this.videoProgress = 0;

    // Reset all file inputs in DOM
    const fileInputs = document.querySelectorAll('input[type="file"]') as NodeListOf<HTMLInputElement>;
    fileInputs.forEach(f => f.value = '');
  }
}
