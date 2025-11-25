// admin-about.service.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';

@Injectable({ providedIn: 'root' })
export class AdminAboutService {

  constructor(
    private firestore: Firestore,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  // Save About Data
  async saveAbout(uid: string, data: any) {
    const ref = doc(this.firestore, `admin-about/${uid}`);
    return setDoc(ref, data, { merge: true });
  }

  // Load About Data
  async getAbout(uid: string) {
    const ref = doc(this.firestore, `admin-about/${uid}`);
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : null;
  }
}
