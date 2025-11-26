import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';

@Injectable({ providedIn: 'root' })
export class AdminExperienceService {

  constructor(
    private firestore: Firestore,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  async saveExperience(uid: string, data: any) {
    const ref = doc(this.firestore, `admin-experience/${uid}`);
    return setDoc(ref, data, { merge: true });
  }

  async getExperience(uid: string) {
    const ref = doc(this.firestore, `admin-experience/${uid}`);
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : null;
  }
}
