import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { Auth, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, User, onAuthStateChanged } from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private platformId = inject(PLATFORM_ID);

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        this.currentUserSubject.next(user);
        if (isPlatformBrowser(this.platformId)) localStorage.setItem('uid', user.uid);
      } else {
        this.currentUserSubject.next(null);
        if (isPlatformBrowser(this.platformId)) localStorage.removeItem('uid');
      }
    });
  }

  async signUp(email: string, password: string) {
    const res = await createUserWithEmailAndPassword(this.auth, email, password);
    this.currentUserSubject.next(res.user);
    if (isPlatformBrowser(this.platformId)) localStorage.setItem('uid', res.user.uid);
    return res;
  }

  async signIn(email: string, password: string) {
    const res = await signInWithEmailAndPassword(this.auth, email, password);
    this.currentUserSubject.next(res.user);
    if (isPlatformBrowser(this.platformId)) localStorage.setItem('uid', res.user.uid);
    return res;
  }

  async signInWithGoogle() {
  if (!isPlatformBrowser(this.platformId)) return; 
  const provider = new GoogleAuthProvider();
  const res = await signInWithPopup(this.auth, provider);
  this.currentUserSubject.next(res.user);
  localStorage.setItem('uid', res.user.uid);
  return res;
}

  logout() {
    this.currentUserSubject.next(null);
    if (isPlatformBrowser(this.platformId)) localStorage.removeItem('uid');
    return signOut(this.auth);
  }

  async saveUserProfile(uid: string, profile: any) {
    const userRef = doc(this.firestore, `users/${uid}`);
    await setDoc(userRef, profile, { merge: true });
  }

  async getUserProfile(uid: string) {
    if (!isPlatformBrowser(this.platformId)) return null;
    const userRef = doc(this.firestore, `users/${uid}`);
    const snap = await getDoc(userRef);
    return snap.exists() ? snap.data() : null;
  }

  getUidFromStorage(): string | null {
    if (isPlatformBrowser(this.platformId)) return localStorage.getItem('uid');
    return null;
  }
}
