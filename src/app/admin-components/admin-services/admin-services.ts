import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-admin-services',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-services.html',
  styleUrl: './admin-services.scss'
})
export class AdminServices {
   serviceTitle = '';
  serviceDescription = '';
  
  featureInput = '';
  features: string[] = [];

  services: any[] = [];

  // Add feature (Max 2)
  addFeature() {
    const v = this.featureInput.trim();
    if (!v) return;
    if (this.features.length >= 2) return; // max 2 only
    if (!this.features.some(f => f.toLowerCase() === v.toLowerCase())) {
      this.features.push(v);
    }
    this.featureInput = '';
  }

  removeFeature(i: number) {
    this.features.splice(i, 1);
  }

  // Add service
  addService() {
    if (!this.serviceTitle) return;

    this.services.push({
      title: this.serviceTitle,
      description: this.serviceDescription,
      features: [...this.features]
    });

    this.serviceTitle = '';
    this.serviceDescription = '';
    this.features = [];
  }

  removeService(i: number) {
    this.services.splice(i, 1);
  }

  getPayload() {
    return {
      services: this.services
    };
  }
}
