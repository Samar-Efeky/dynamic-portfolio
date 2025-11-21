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
  fullName = '';
  username = '';
  mainJobTitle = '';
  relatedJobTitle = '';         
  relatedJobTitles: string[] = []; 
  profileImage: string | ArrayBuffer | null = null;
  socialPlatform = 'LinkedIn'; 
  socialLink = '';           
  socialLinks: { platform: string; url: string }[] = [];
  
  addRelatedJobTitle() {
    const v = this.relatedJobTitle?.trim();
    if (!v) return;
    // avoid duplicate (case-insensitive)
    if (!this.relatedJobTitles.some(t => t.toLowerCase() === v.toLowerCase())) {
      this.relatedJobTitles.push(v);
    }
    this.relatedJobTitle = '';
  }
  removeRelatedJobTitle(index: number) {
    this.relatedJobTitles.splice(index, 1);
  }
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
  addSocialLink() {
    const url = this.socialLink?.trim();
    if (!url) return;
    if (!this.socialLinks.some(s => s.url === url)) {
      this.socialLinks.push({
        platform: this.socialPlatform,
        url
      });
    }
    this.socialLink = '';
    this.socialPlatform = 'LinkedIn'; 
  }
  removeSocialLink(index: number) {
    this.socialLinks.splice(index, 1);
  }
  getPayload() {
    return {
      fullName: this.fullName,
      username: this.username,
      mainJobTitle: this.mainJobTitle,
      relatedJobTitles: this.relatedJobTitles,
      profileImageDataUrl: this.profileImage,
      socialLinks: this.socialLinks
    };
  }
}
