// admin-blogs.service.ts
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';
import { isPlatformBrowser } from '@angular/common';
import { deleteObject } from 'firebase/storage';

@Injectable({ providedIn: 'root' })
export class AdminBlogsService {
  private firestore = inject(Firestore);
  private storage = inject(Storage);
  private platformId = inject(PLATFORM_ID);

  // ==============================
  // Get blogs data
  // ==============================
  async getBlogs(uid: string) {
    if (!isPlatformBrowser(this.platformId)) return null;
    const ref = doc(this.firestore, `admin-blogs/${uid}`);
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : null;
  }

  // ==============================
  // Update Blogs Array
  // ==============================
  async updateBlogs(userId: string, blogs: any[]) {
    const userDoc = doc(this.firestore, `admin-blogs/${userId}`);
    await setDoc(userDoc, { blogs }, { merge: true });
  }

  // ==============================
  // Upload Blog Image
  // ==============================
  async uploadImage(file: File, path: string): Promise<string> {
    if (!isPlatformBrowser(this.platformId)) return '';
    const storageRef = ref(this.storage, path);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  }

  // ==============================
  // Delete Image from Firebase Storage
  // ==============================
  async deleteImage(imageUrl: string) {
    try {
      const storageRef = ref(this.storage, imageUrl);
      await deleteObject(storageRef);
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  }
  // ==============================
// Get Single Blog By ID
// ==============================
async getBlogById(uid: string, blogId: string | number) {
  if (!isPlatformBrowser(this.platformId)) return null;

  const data = await this.getBlogs(uid);
  if (!data || !data['blogs']) return null;

  const blogs = data['blogs'];
  const blog = blogs.find((b: any) => b.id == blogId);

  return blog || null;
}
}
