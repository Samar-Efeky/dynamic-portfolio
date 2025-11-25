import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
@Injectable({ providedIn: 'root' })
export class AdminInfoService {

  constructor(
    private firestore: Firestore,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  // حفظ البيانات
  async saveAdminInfo(uid: string, data: any) {
    const ref = doc(this.firestore, `admin-info/${uid}`);
    return setDoc(ref, data, { merge: true });
  }

  // تحميل البيانات
  async getAdminInfo(uid: string) {
    const ref = doc(this.firestore, `admin-info/${uid}`);
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : null;
  }
}
