import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { Firestore, doc, setDoc, getDoc, collection, query, where, getDocs } from '@angular/fire/firestore';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class AdminInfoService {
  private firestore = inject(Firestore);
  private platformId = inject(PLATFORM_ID);

  async saveAdminInfo(uid: string, data: any) {
    if (!isPlatformBrowser(this.platformId)) return;
    const ref = doc(this.firestore, `admin-info/${uid}`);
    return setDoc(ref, { ...data, uid }, { merge: true });
  }

  async getAdminInfo(uid: string) {
    if (!isPlatformBrowser(this.platformId)) return null;
    const ref = doc(this.firestore, `admin-info/${uid}`);
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : null;
  }

  async getAdminInfoByUsername(username: string) {
  if (!isPlatformBrowser(this.platformId)) return null;

  const q = query(collection(this.firestore, 'admin-info'), where('username', '==', username));
  const snap = await getDocs(q);

  if (snap.empty) return null;

  const docSnap = snap.docs[0];
  return { uid: docSnap.id, ...docSnap.data() };
}
}
