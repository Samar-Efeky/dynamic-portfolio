import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-admin-info',
  imports: [CommonModule,FormsModule],
  templateUrl: './admin-info.html',
  styleUrl: './admin-info.scss'
})
export class AdminInfo {
 // Basic fields
  fullName = '';
  username = '';
  mainJobTitle = '';

  // Related job titles (tag input)
  relatedJobTitle = '';          // current input value
  relatedJobTitles: string[] = []; // tags array

  // Profile image preview (Data URL)
  profileImage: string | ArrayBuffer | null = null;

  // Social links with platform type
  socialPlatform = 'LinkedIn'; // default selected platform
  socialLink = '';             // current url input
  socialLinks: { platform: string; url: string }[] = [];

  // ---------- Methods ----------

  /**
   * Add a related job title as a tag.
   * Ignores empty or duplicate values.
   */
  addRelatedJobTitle() {
    const v = this.relatedJobTitle?.trim();
    if (!v) return;
    // avoid duplicate (case-insensitive)
    if (!this.relatedJobTitles.some(t => t.toLowerCase() === v.toLowerCase())) {
      this.relatedJobTitles.push(v);
    }
    this.relatedJobTitle = '';
  }

  /**
   * Remove a related job title by index.
   */
  removeRelatedJobTitle(index: number) {
    this.relatedJobTitles.splice(index, 1);
  }

  /**
   * Handle file input change and create a Data URL preview.
   * This does not upload the file; uploading should be implemented separately (e.g., Firebase Storage).
   */
  uploadImage(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.profileImage = reader.result;
    };
    reader.readAsDataURL(file);
  }

  /**
   * Add a social link object { platform, url }.
   * Performs basic validation (non-empty, not duplicate).
   */
  addSocialLink() {
    const url = this.socialLink?.trim();
    if (!url) return;

    // simple duplicate check
    if (!this.socialLinks.some(s => s.url === url)) {
      this.socialLinks.push({
        platform: this.socialPlatform,
        url
      });
    }
    this.socialLink = '';
    this.socialPlatform = 'LinkedIn'; // reset to default (optional)
  }

  /**
   * Remove social link by index.
   */
  removeSocialLink(index: number) {
    this.socialLinks.splice(index, 1);
  }

  /**
   * (Optional) Example method to gather payload before saving.
   * Integrate with your backend or Firebase in real app.
   */
  getPayload() {
    return {
      fullName: this.fullName,
      username: this.username,
      mainJobTitle: this.mainJobTitle,
      relatedJobTitles: this.relatedJobTitles,
      profileImageDataUrl: this.profileImage, // base64 / data url
      socialLinks: this.socialLinks
    };
  }
}
