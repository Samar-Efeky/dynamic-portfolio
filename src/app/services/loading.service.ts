// Service to manage loading state
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loading = new BehaviorSubject<boolean>(false); // current state
  isLoading$ = this.loading.asObservable();             // observable for components

  // Show loading screen
  show() {
    this.loading.next(true);
  }

  // Hide loading screen
  hide() {
    this.loading.next(false);
  }
}
