import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-admin-projects',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-projects.html',
  styleUrl: './admin-projects.scss'
})
export class AdminProjects {
   projectTitle = '';
  projectDescription = '';
  liveLink = '';

  skills: string[] = [];
  skillInput = '';

  gallery: string[] = [];
  projects: any[] = [];

  // Add skill
  addSkill() {
    const v = this.skillInput.trim();
    if (!v) return;
    if (!this.skills.some(s => s.toLowerCase() === v.toLowerCase())) {
      this.skills.push(v);
    }
    this.skillInput = '';
  }

  removeSkill(i: number) {
    this.skills.splice(i, 1);
  }

  // Upload image (max 3)
  uploadImage(event: Event) {
    if (this.gallery.length >= 3) return;

    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (this.gallery.length < 3) {
        this.gallery.push(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  }

  removeImage(i: number) {
    this.gallery.splice(i, 1);
  }

  // Add project
  addProject() {
    if (!this.projectTitle) return;

    this.projects.push({
      title: this.projectTitle,
      description: this.projectDescription,
      live: this.liveLink,
      skills: [...this.skills],
      gallery: [...this.gallery]
    });

    this.projectTitle = '';
    this.projectDescription = '';
    this.liveLink = '';
    this.skills = [];
    this.gallery = [];
  }

  removeProject(i: number) {
    this.projects.splice(i, 1);
  }

  getPayload() {
    return {
      projects: this.projects
    };
  }
}
