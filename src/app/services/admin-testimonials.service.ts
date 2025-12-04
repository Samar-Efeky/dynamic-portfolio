import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { Storage, ref, uploadBytes, getDownloadURL, deleteObject } from '@angular/fire/storage';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class AdminTestimonialsService {
  // Inject Firestore, Storage, and Platform ID
  private firestore = inject(Firestore);
  private storage = inject(Storage);
  private platformId = inject(PLATFORM_ID);

  // ================= Firestore: Save Testimonials =================
  async saveTestimonials(uid: string, data: any) {
    if (!isPlatformBrowser(this.platformId)) return; 
    const refDoc = doc(this.firestore, `admin-testimonials/${uid}`);
    return setDoc(refDoc, data, { merge: true }); 
  }

  // ================= Firestore: Get Testimonials =================
  async getTestimonials(uid: string) {
    if (!isPlatformBrowser(this.platformId)) return null; 
    const refDoc = doc(this.firestore, `admin-testimonials/${uid}`);
    const snap = await getDoc(refDoc);
    return snap.exists() ? snap.data() : null; 
  }

  // ================= Upload Image to Storage =================
  async uploadImage(file: File, uid: string) {
    const path = `testimonials/${uid}/${Date.now()}-${file.name}`; 
    const storageRef = ref(this.storage, path);
    await uploadBytes(storageRef, file); 
    return getDownloadURL(storageRef); 
  }

  // ================= Delete Image from Storage =================
  async deleteImage(url: string) {
    if (!isPlatformBrowser(this.platformId)) return; 
    try {
      const imageRef = ref(this.storage, url);
      await deleteObject(imageRef); // Delete the file
    } catch (err) {
      console.warn('Error deleting image from storage:', err); 
    }
  }
}
