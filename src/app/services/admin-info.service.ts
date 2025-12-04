import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { Firestore, doc, setDoc, getDoc, collection, query, where, getDocs } from '@angular/fire/firestore';
import { Storage, ref, uploadBytes, getDownloadURL, deleteObject, uploadBytesResumable } from '@angular/fire/storage';
import { isPlatformBrowser } from '@angular/common';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AdminInfoService {
  // Inject Firestore, Storage, and Platform ID
  private firestore = inject(Firestore);
  private storage = inject(Storage);
  private platformId = inject(PLATFORM_ID);

  // -------------------------------
  // Save or update admin info in Firestore
  // -------------------------------
  async saveAdminInfo(uid: string, data: any) {
    if (!isPlatformBrowser(this.platformId)) return;
    const refDoc = doc(this.firestore, `admin-info/${uid}`);
    return setDoc(refDoc, { ...data, uid }, { merge: true });
  }

  // -------------------------------
  // Get admin info by UID
  // -------------------------------
  async getAdminInfo(uid: string) {
    if (!isPlatformBrowser(this.platformId)) return null;
    const refDoc = doc(this.firestore, `admin-info/${uid}`);
    const snap = await getDoc(refDoc);
    return snap.exists() ? snap.data() : null;
  }

  // -------------------------------
  // Get admin info by username
  // -------------------------------
  async getAdminInfoByUsername(username: string) {
    if (!isPlatformBrowser(this.platformId)) return null;
    const q = query(collection(this.firestore, 'admin-info'), where('username', '==', username));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const docSnap = snap.docs[0];
    return { uid: docSnap.id, ...docSnap.data() };
  }

  // -------------------------------
  // Upload profile or logo image
  // Returns the download URL
  // -------------------------------
  async uploadImageFile(file: File, type: 'profile' | 'logo', uid: string): Promise<string> {
    const path = type === 'profile' ? 'profile-images' : 'logo-images';
    const fileRef = ref(this.storage, `${path}/${uid}-${file.name}`);
    await uploadBytes(fileRef, file);
    return getDownloadURL(fileRef);
  }

  // -------------------------------
  // Delete file from Firebase Storage by URL
  // -------------------------------
  async deleteFileByUrl(url: string) {
    if (!url) return;
    try {
      const storageRef = ref(this.storage, url);
      await deleteObject(storageRef);
      console.log('File deleted successfully');
    } catch (err) {
      console.error('Error deleting file:', err);
    }
  }

  // -------------------------------
  // Upload video file with progress tracking
  // Returns observable for progress and a promise for download URL
  // -------------------------------
  uploadVideoFileWithProgress(file: File, uid: string, fieldName: string) {
    const progress = new Subject<number>();
    const path = `admins/${uid}/${fieldName}-${file.name}`;
    const storageRef = ref(this.storage, path);

    if (!isPlatformBrowser(this.platformId)) {
      return { progress: progress.asObservable(), downloadURL: Promise.resolve(''), storagePath: path };
    }

    const uploadTask = uploadBytesResumable(storageRef, file);

    const downloadURLPromise = new Promise<string>((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Calculate upload progress percentage
          const percent = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          progress.next(Math.round(percent));
        },
        (error) => {
          progress.error(error);
          reject(error);
        },
        async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          progress.complete();
          resolve(url);
        }
      );
    });

    return { progress: progress.asObservable(), downloadURL: downloadURLPromise, storagePath: path };
  }

  // -------------------------------
  // Delete video file from Firebase Storage by path
  // -------------------------------
  deleteVideoFileByPath(path: string) {
    if (!path) return;
    const storageRef = ref(this.storage, path);
    return deleteObject(storageRef);
  }
}
