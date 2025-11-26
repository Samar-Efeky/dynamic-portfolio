import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
@Injectable({ providedIn: 'root' })
export class AdminProjectsService {
  constructor(
    private firestore: Firestore,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  // Save all projects
  async saveProjects(uid: string, data: any) {
    const ref = doc(this.firestore, `admin-projects/${uid}`);
    return setDoc(ref, data, { merge: true });
  }

  // Load projects
  async getProjects(uid: string) {
    const ref = doc(this.firestore, `admin-projects/${uid}`);
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : { projects: [] };
  }
}
