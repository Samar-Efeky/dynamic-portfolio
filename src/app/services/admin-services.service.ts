// admin-services.service.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';

@Injectable({ providedIn: 'root' })
export class AdminServicesService {

  constructor(
    private firestore: Firestore,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  // Save services
  async saveServices(uid: string, data: any) {
    const ref = doc(this.firestore, `admin-services/${uid}`);
    return setDoc(ref, data, { merge: true });
  }

  // Load services
  async getServices(uid: string) {
    const ref = doc(this.firestore, `admin-services/${uid}`);
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : null;
  }
}
