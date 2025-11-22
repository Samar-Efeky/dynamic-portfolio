import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-admin-experience',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-experience.html',
  styleUrl: './admin-experience.scss'
})
export class AdminExperience {
   companyName = '';
  role = '';
  startDate = '';
  endDate = '';
  experienceDescription = '';
  experiences: any[] = [];

  addExperience() {
    if (!this.companyName || !this.role) return;

    this.experiences.push({
      company: this.companyName,
      role: this.role,
      start: this.startDate,
      end: this.endDate,
      description: this.experienceDescription
    });

    this.companyName = '';
    this.role = '';
    this.startDate = '';
    this.endDate = '';
    this.experienceDescription = '';
  }

  removeExperience(i: number) {
    this.experiences.splice(i, 1);
  }


  // SKILLS
  skillInput = '';
  skills: string[] = [];

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


  // EDUCATION
  institution = '';
  degree = '';
  eduStart = '';
  eduEnd = '';
  education: any[] = [];

  addEducation() {
    if (!this.institution || !this.degree) return;

    this.education.push({
      institution: this.institution,
      degree: this.degree,
      start: this.eduStart,
      end: this.eduEnd
    });

    this.institution = '';
    this.degree = '';
    this.eduStart = '';
    this.eduEnd = '';
  }

  removeEducation(i: number) {
    this.education.splice(i, 1);
  }


  // CERTIFICATIONS (Max 3)
  certifications: string[] = [];

  uploadCert(event: Event) {
    if (this.certifications.length >= 3) return;

    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (this.certifications.length < 3) {
        this.certifications.push(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  }

  removeCert(i: number) {
    this.certifications.splice(i, 1);
  }

  getPayload() {
    return {
      experiences: this.experiences,
      skills: this.skills,
      education: this.education,
      certifications: this.certifications
    };
  }
}
