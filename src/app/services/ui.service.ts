import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UiService {
  private _loading = new BehaviorSubject<boolean>(false);
  private _success = new BehaviorSubject<boolean>(false);
  private _cvSuccess = new BehaviorSubject<boolean>(false); 

  loading$ = this._loading.asObservable();
  success$ = this._success.asObservable();
  cvSuccess$ = this._cvSuccess.asObservable(); 
  showLoader() { this._loading.next(true); }
  hideLoader() { this._loading.next(false); }

  showSuccess() { 
    this._success.next(true); 
    setTimeout(() => this._success.next(false), 2000); 
  }

  hideSuccess() {
    this._success.next(false);
  }

  // ===== Success  CV =====
  showCVSuccess() {
    this._cvSuccess.next(true);
    setTimeout(() => this._cvSuccess.next(false), 2000);
  }

  hideCVSuccess() {
    this._cvSuccess.next(false);
  }
}
