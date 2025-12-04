import { Injectable } from '@angular/core';
import { Firestore, addDoc, collection, query, where, getDocs } from '@angular/fire/firestore';

@Injectable({ providedIn: 'root' })
export class NewsletterService {

  constructor(private firestore: Firestore) {}

  async addSubscriber(email: string) {
    const ref = collection(this.firestore, 'newsletter');

    // 1) check if email already exists
    const q = query(ref, where('email', '==', email));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      // Email already exists
      throw new Error('EMAIL_EXISTS');
    }

    // 2) add email if not existing
    return addDoc(ref, {
      email,
      subscribedAt: new Date(),
    });
  }
}
