import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { isPlatformBrowser} from '@angular/common';

@Injectable({ providedIn: 'root' })
export class AdminProjectsService {
  private firestore = inject(Firestore);
  private platformId = inject(PLATFORM_ID);

  async saveProjects(uid: string, data: any) {
    if (!isPlatformBrowser(this.platformId)) return;
    const ref = doc(this.firestore, `admin-projects/${uid}`);
    return setDoc(ref, data, { merge: true });
  }

  async getProjects(uid: string) {
    if (!isPlatformBrowser(this.platformId)) return null;
    const ref = doc(this.firestore, `admin-projects/${uid}`);
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : { projects: [] };
  }
  async getProjectById(uid: string, projectId: string) {
  if (!isPlatformBrowser(this.platformId)) return null;
  const ref = doc(this.firestore, `admin-projects/${uid}`);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;

  const data = snap.data();
  const projects: any[] = data?.['projects'] || [];
  const project = projects.find(p => p.id === projectId);
  return project || null;
}

}
