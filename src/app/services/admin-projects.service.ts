import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { Storage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from '@angular/fire/storage';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class AdminProjectsService {
  // ------------------ Inject Firestore, Storage, and Platform ID ------------------
  private firestore = inject(Firestore);
  private storage = inject(Storage);
  private platformId = inject(PLATFORM_ID);

  // ================= Firestore Methods =================

  /** Save or update all projects for a user */
  async saveProjects(uid: string, data: any) {
    if (!isPlatformBrowser(this.platformId)) return; // SSR check
    const refDoc = doc(this.firestore, `admin-projects/${uid}`);
    return setDoc(refDoc, data, { merge: true });
  }

  /** Get all projects for a user */
  async getProjects(uid: string) {
    if (!isPlatformBrowser(this.platformId)) return null;
    const refDoc = doc(this.firestore, `admin-projects/${uid}`);
    const snap = await getDoc(refDoc);
    return snap.exists() ? snap.data() : { projects: [] };
  }

  /** Get a single project by its ID */
  async getProjectById(uid: string, projectId: string) {
    if (!isPlatformBrowser(this.platformId)) return null;
    const refDoc = doc(this.firestore, `admin-projects/${uid}`);
    const snap = await getDoc(refDoc);

    if (!snap.exists()) return null;
    const data = snap.data();
    const arr = data?.['projects'] || [];
    return arr.find((p: any) => p.id === projectId) || null;
  }

  // ================= Storage Methods =================

  /** Upload an image to Firebase Storage and return the download URL */
  async uploadImage(uid: string, file: File): Promise<string> {
    if (!isPlatformBrowser(this.platformId)) return '';

    // Generate unique file name
    const fileName = `${crypto.randomUUID()}-${file.name}`;
    const storageRef = ref(this.storage, `projects/${uid}/${fileName}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    // Return a promise that resolves with the download URL
    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        null,
        err => reject(err), // On error
        async () => resolve(await getDownloadURL(uploadTask.snapshot.ref)) // On success
      );
    });
  }

  /** Delete an image from Firebase Storage using its download URL */
  async deleteImage(url: string) {
    if (!isPlatformBrowser(this.platformId)) return;

    // Convert download URL to Storage path
    const decoded = decodeURIComponent(url.split('/o/')[1].split('?')[0]);
    const storageRef = ref(this.storage, decoded);
    return deleteObject(storageRef);
  }

  /** List all image paths for a user's projects in Storage */
  async listAllProjectImages(uid: string): Promise<string[]> {
    const storageRef = ref(this.storage, `projects/${uid}`);
    const { listAll } = await import('firebase/storage');
    const res = await listAll(storageRef);

    // Return array of full paths
    return res.items.map(item => item.fullPath);
  }
}
