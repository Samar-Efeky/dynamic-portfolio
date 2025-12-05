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
// Async validator to check if the username is unique
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
// Validator to check minimum length of FormArray
export function minLengthArray(min: number) {
  return (control: AbstractControl): ValidationErrors | null => {
    const arr = control as FormArray;
    return arr.length >= min ? null : { minLengthArray: true };
  };
}
// Validator to check maximum length of FormArray
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
  // ================================ Properties ================================
  form!: FormGroup;
  uid: any = null; // Current user UID
  urlPlaceholder: string = 'Platform URL (e.g. https://example.com/...)';
  profileImagePreview: string | ArrayBuffer | null = null;
  logoImagePreview: string | ArrayBuffer | null = null;

  videoFile: File | null = null;
  videoPreview: string | null = null;
  videoProgress: number = 0;
  videoUploadSub: Subscription | null = null;
  videoError: string = '';

  private subs = new Subscription(); // General subscription container
  private fileReader: FileReader | null = null; // Single FileReader for cleanup
  private profileImageFile: File | null = null;
  private logoImageFile: File | null = null;
  private resizeTimeout: any; // Timeout for auto-resize textareas
  private textareaElements: HTMLTextAreaElement[] = []; // Store all textarea elements
  currentUsername: string = '';

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
      // Initialize form
    this.form = this.fb.group({
      fullName: ['', [Validators.required]],
      username: ['', 
        [Validators.required, Validators.pattern(/^\S+$/)],
        [usernameUniqueValidator(this.adminService, this.uid)]
      ],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      address: ['', Validators.required],
      mainJobTitle: ['', [Validators.required]],
      buttonInHeroSection:[''],
      socialLinks: this.fb.array([], [minLengthArray(3)]),
      profileImage: ['', Validators.required],
      logoImage: ['', Validators.required],
      introVideo: [''], 
      introVideoPath: [''], 
      publicDescription: ['', [Validators.required]],
    });

    if (this.uid) this.loadData();
    this.resizeTimeout = setTimeout(() => this.autoResizeAll(), 0);
  }
// Getter for social links FormArray
  get socialLinksArray() {
    return this.form.get('socialLinks') as FormArray;
  }

  // ================================ Social Links ================================
  socialError: string = '';
  addSocial(platform: string, url: string) {
    platform = platform.trim();
    url = url.trim();
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
  // Remove social link at index
  removeSocial(i: number) {
    this.socialLinksArray.removeAt(i);
  }
 // Update placeholder for social URL input
  updateUrlPlaceholder(platform: string) {
    const p = platform.trim().toLowerCase();
    this.urlPlaceholder = p ? `https://${p}.com/your-profile` : 'Platform URL (e.g. https://example.com/...)';
  }
  // Return icon HTML for social platform
  getPlatformIcon(platform: string) {
    if (!platform) return '';
    const p = platform.trim().toLowerCase();
    const knownPlatforms =
      ['linkedin','facebook','twitter','instagram','github','youtube','tiktok','behance','dribbble'];
    return knownPlatforms.includes(p)
      ? `<i class="fab fa-${p} span-color"></i>`
      : `<i class="fa-solid fa-earth-americas span-color"></i>`;
  }
   // Drag and drop for social links
 drop(event: CdkDragDrop<any>) {
  moveItemInArray(this.socialLinksArray.controls, event.previousIndex, event.currentIndex);
  this.socialLinksArray.updateValueAndValidity();
}


  // ================================ Upload Image ================================
 async uploadImage(event: Event, type: 'profile' | 'logo') {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    if (type === 'profile') {
      this.profileImagePreview = reader.result;
      this.profileImageFile = file;
    } else {
      this.logoImagePreview = reader.result;
      this.logoImageFile = file;
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
// Validate video type and size
  const validTypes = ['video/mp4','video/webm','video/ogg','video/quicktime','video/x-m4v'];
  if (!validTypes.includes(file.type)) { this.videoError = 'Only video files are allowed'; return; }
  if (file.size > 30 * 1024 * 1024) { this.videoError = 'Maximum allowed size is 30MB'; return; }

  const reader = new FileReader();
  reader.onload = () => this.videoPreview = reader.result as string;
  reader.readAsDataURL(file);

  if (!this.uid) return;

  try {
    // Delete old video if exists
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
 // Remove uploaded video
  async removeVideo() {
  if (!this.uid || !this.form.value.introVideoPath) return;

  try {
    await this.adminService.deleteVideoFileByPath(this.form.value.introVideoPath);
    this.form.patchValue({ introVideo: '', introVideoPath: '',introVideoStoragePath: '' });
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
    let profileImageUrl = this.form.value.profileImage;
    let logoImageUrl = this.form.value.logoImage;

     // Upload profile image and delete old one
    if (this.profileImageFile) {
      if (profileImageUrl) await this.adminService.deleteFileByUrl(profileImageUrl);
      profileImageUrl = await this.adminService.uploadImageFile(this.profileImageFile, 'profile', this.uid);
    }

    // Upload logo image and delete old one
    if (this.logoImageFile) {
      if (logoImageUrl) await this.adminService.deleteFileByUrl(logoImageUrl);
      logoImageUrl = await this.adminService.uploadImageFile(this.logoImageFile, 'logo', this.uid);
    }

    const formData = {
      ...this.form.value,
      profileImage: profileImageUrl,
      logoImage: logoImageUrl
    };

    await this.adminService.saveAdminInfo(this.uid, formData);
    await this.dataCheck.checkAllData(this.uid);

    this.uiService.hideLoader();
    this.uiService.showSuccess();
  } catch (err) {
    this.uiService.hideLoader();
    console.error(err);
    alert('An error occurred while saving data.');
  }
}

  // ================================ Load Data ================================
  async loadData() {
    if (!this.uid) return;

    const data = await this.adminService.getAdminInfo(this.uid);

    if (data) {
      this.currentUsername = data['username'] || '';
      this.form.patchValue({
        fullName: data['fullName'],
        username: data['username'],
        email: data['email'],
        phone: data['phone'],
        address: data['address'],
        mainJobTitle: data['mainJobTitle'],
        buttonInHeroSection:data['buttonInHeroSection'] || '',
        profileImage: data['profileImage'] || '',
        publicDescription: data['publicDescription'] || '',
        logoImage: data['logoImage'] || '',
        introVideo: data['introVideo'] || '',
        introVideoPath: data['introVideoPath'] || ''
      });

      this.form.get('username')?.setAsyncValidators(
        usernameUniqueValidator(this.adminService, this.uid)
      );
      this.form.get('username')?.updateValueAndValidity({ emitEvent: false });

      this.profileImagePreview = data['profileImage'] || null;
      this.logoImagePreview = data['logoImage'] || null;
      if (data['introVideo']) this.videoPreview = data['introVideo'];
      // Load social links
      if (data['socialLinks']) {
        data['socialLinks'].forEach((s: any) =>
          this.socialLinksArray.push(this.fb.group({ platform: s.platform, url: s.url }))
        );
      }
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
    this.subs.unsubscribe();
    if (this.resizeTimeout) clearTimeout(this.resizeTimeout);
    this.textareaElements = [];
    if (this.fileReader) {
      this.fileReader.onload = null;
      this.fileReader.abort();
      this.fileReader = null;
    }
    this.socialLinksArray.clear();
    this.form.reset();
    this.profileImagePreview = null;
    this.logoImagePreview = null;
    this.profileImageFile = null;
    this.logoImageFile = null;
    this.videoFile = null;
    this.videoPreview = null;
    this.videoProgress = 0;
    this.videoUploadSub?.unsubscribe();
    // Reset all file inputs
    const fileInputs = document.querySelectorAll('input[type="file"]') as NodeListOf<HTMLInputElement>;
    fileInputs.forEach(f => f.value = '');
  }
}
