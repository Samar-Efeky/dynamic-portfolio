import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';

@Injectable({ providedIn: 'root' })
export class AdminBlogsService {

  constructor(
    private firestore: Firestore,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  async saveBlogs(uid: string, data: any) {
    const ref = doc(this.firestore, `admin-blogs/${uid}`);
    return setDoc(ref, data, { merge: true });
  }

  async getBlogs(uid: string) {
    const ref = doc(this.firestore, `admin-blogs/${uid}`);
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : null;
  }
}
