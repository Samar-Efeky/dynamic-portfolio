import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-admin-testimonials',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-testimonials.html',
  styleUrl: './admin-testimonials.scss'
})
export class AdminTestimonials {
  clientName = '';
  clientTitle = '';
  clientDescription = '';

  clientImage: string | null = null;

  testimonials: any[] = [];

  // Upload client image
  uploadImage(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.clientImage = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  // Remove uploaded image
  removeImage() {
    this.clientImage = null;
  }

  // Add a new testimonial
  addTestimonial() {
    if (!this.clientName || !this.clientImage) return;

    this.testimonials.push({
      name: this.clientName,
      title: this.clientTitle,
      description: this.clientDescription,
      image: this.clientImage
    });

    this.clientName = '';
    this.clientTitle = '';
    this.clientDescription = '';
    this.clientImage = null;
  }

  // Remove testimonial
  removeTestimonial(i: number) {
    this.testimonials.splice(i, 1);
  }

  // Optional: Send payload
  getPayload() {
    return {
      testimonials: this.testimonials
    };
  }
}
