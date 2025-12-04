import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { Storage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from '@angular/fire/storage';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class AdminExperienceService {
  private firestore = inject(Firestore);
  private storage = inject(Storage);
  private platformId = inject(PLATFORM_ID);

  // ==========================================
  // Save or Update Experience Data in Firestore
  // ==========================================
  async saveExperience(uid: string, data: any) {
    if (!isPlatformBrowser(this.platformId)) return;

    const ref = doc(this.firestore, `admin-experience/${uid}`);
    // merge:true keeps old data and updates only the changed fields
    return setDoc(ref, data, { merge: true });
  }

  // ==========================================
  // Get Experience Data From Firestore
  // ==========================================
  async getExperience(uid: string) {
    if (!isPlatformBrowser(this.platformId)) return null;

    const ref = doc(this.firestore, `admin-experience/${uid}`);
    const snap = await getDoc(ref);

    // Return document data if exists, otherwise null
    return snap.exists() ? snap.data() : null;
  }

  // ==========================================
  // Upload Certification Image to Firebase Storage
  // Returns: Public Download URL
  // ==========================================
  uploadCertificationFile(file: File, uid: string): Promise<string> {
    // Create unique path for each file
    const path = `certifications/${uid}/${Date.now()}-${file.name}`;
    const storageRef = ref(this.storage, path);

    return new Promise<string>((resolve, reject) => {
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        () => {
          // You can handle upload progress here if needed
        },
        error => reject(error),
        async () => {
          // File uploaded → get public URL
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(url);
        }
      );
    });
  }
  // ==========================================
  // Delete File From Firebase Storage Using Its URL
  // ==========================================
  deleteFileByUrl(url: string) {
    if (!url) return Promise.resolve();

    // Convert URL to storage reference
    const storageRef = ref(this.storage, url);

    // Delete the file
    return deleteObject(storageRef);
  }
}
