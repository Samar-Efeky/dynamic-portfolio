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
  ValidationErrors
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AdminInfoService } from '../../services/admin-info.service';
import { AuthService } from '../../services/auth';
import { UiService } from '../../services/ui.service';
import { Subscription } from 'rxjs';

// ================================
//        Custom Validators
// ================================
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

@Component({
  selector: 'app-admin-info',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-info.html',
  styleUrl: './admin-info.scss'
})
export class AdminInfo implements OnInit, OnDestroy {

  form!: FormGroup;
  uid: string | null = null;
  profileImagePreview: string | ArrayBuffer | null = null;

  private subs = new Subscription();
  private fileReader: FileReader | null = null;

  constructor(
    private fb: FormBuilder,
    private adminService: AdminInfoService,
    private authService: AuthService,
    public uiService: UiService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    this.uid = this.authService.getUidFromStorage();

    // ================================
    //         Main Form
    // ================================
    this.form = this.fb.group({
      fullName: ['', [Validators.required, Validators.pattern(/^\w+\s+\w+$/)]],
      username: ['', [Validators.required, Validators.pattern(/^\S+$/)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      location: ['', Validators.required],
      mainJobTitle: ['', [
        Validators.required,
        Validators.pattern(/^\S+\s+\S+\s+\S+$/)
      ]],

      relatedJobTitles: this.fb.array([], [
        minLengthArray(4),
        maxLengthArray(5)
      ]),

      socialLinks: this.fb.array([], [
        minLengthArray(3)
      ]),

      profileImage: ['', Validators.required]
    });

    if (this.uid) this.loadData();
  }

  // Getters
  get relatedJobTitlesArray() {
    return this.form.get('relatedJobTitles') as FormArray;
  }

  get socialLinksArray() {
    return this.form.get('socialLinks') as FormArray;
  }

  // ================================
  //       Related Job Titles
  // ================================
  addRelatedJobTitle(value: string) {
    if (!value.trim()) return;
    if (this.relatedJobTitlesArray.length >= 5) return;

    this.relatedJobTitlesArray.push(this.fb.control(value));
  }

  removeRelatedJobTitle(i: number) {
    this.relatedJobTitlesArray.removeAt(i);
  }

  // ================================
  //          Social Links
  // ================================
  addSocial(platform: string, url: string) {
    if (!url.trim()) return;

    const exists = this.socialLinksArray.controls.some(
      (s: any) => s.value.platform === platform
    );

    if (exists) {
      alert(`${platform} is already added!`);
      return;
    }

    this.socialLinksArray.push(
      this.fb.group({ platform, url })
    );
  }

  removeSocial(i: number) {
    this.socialLinksArray.removeAt(i);
  }

  // ================================
  //           Upload Image
  // ================================
  uploadImage(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.fileReader = new FileReader();
    this.fileReader.onload = () => {
      this.profileImagePreview = this.fileReader?.result || null;
      this.form.patchValue({ profileImage: this.fileReader?.result });
    };

    this.fileReader.readAsDataURL(file);
  }

  // ================================
  //           Save Data
  // ================================
  async saveData() {
    if (!this.uid || this.form.invalid) return;

    this.uiService.showLoader();
    try {
      await this.adminService.saveAdminInfo(this.uid, this.form.value);
      this.uiService.hideLoader();
      this.uiService.showSuccess();
    } catch (err) {
      this.uiService.hideLoader();
      console.error(err);
      alert('An error occurred while saving data.');
    }
  }

  // ================================
  //           Load Data
  // ================================
  async loadData() {
    if (!this.uid) return;

    const data = await this.adminService.getAdminInfo(this.uid);

    if (data) {
      this.form.patchValue({
        fullName: data['fullName'],
        username: data['username'],
        email: data['email'],
        phone: data['phone'],
        location: data['location'],
        mainJobTitle: data['mainJobTitle'],
        profileImage: data['profileImage'] || ''
      });

      this.profileImagePreview = data['profileImage'];

      if (data['relatedJobTitles']) {
        data['relatedJobTitles'].forEach((x: string) =>
          this.relatedJobTitlesArray.push(this.fb.control(x))
        );
      }

      if (data['socialLinks']) {
        data['socialLinks'].forEach((s: any) =>
          this.socialLinksArray.push(
            this.fb.group({ platform: s.platform, url: s.url })
          )
        );
      }
    }
  }

  // ================================
  //         Cleanup On Destroy
  // ================================
  ngOnDestroy() {

    // 1. Cancel all subscriptions
    this.subs.unsubscribe();

    // 2. Cleanup FileReader
    if (this.fileReader) {
      this.fileReader.onload = null;
      this.fileReader.abort();
      this.fileReader = null;
    }

    // 3. Clear form arrays
    this.relatedJobTitlesArray.clear();
    this.socialLinksArray.clear();

    // 4. Reset form
    this.form.reset();

    // 5. Remove image preview
    this.profileImagePreview = null;

    // 6. Reset file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) fileInput.value = '';

  }
}
