import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserStateService {

  uid = signal<string | null>(null);
  username = signal<string | null>(null);  

}
