// admin-testimonials.service.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';

@Injectable({ providedIn: 'root' })
export class AdminTestimonialsService {

  constructor(
    private firestore: Firestore,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  // Save data
  async saveTestimonials(uid: string, data: any) {
    const ref = doc(this.firestore, `admin-testimonials/${uid}`);
    return setDoc(ref, data, { merge: true });
  }

  // Load data
  async getTestimonials(uid: string) {
    const ref = doc(this.firestore, `admin-testimonials/${uid}`);
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : null;
  }
}
