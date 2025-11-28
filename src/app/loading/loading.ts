import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { LoadingService } from '../services/loading.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading',
  imports: [CommonModule],
  templateUrl: './loading.html',
  styleUrl: './loading.scss',
})
export class Loading implements OnInit, OnDestroy{
 isLoading = false;
  private subscription!: Subscription; // store subscription to unsubscribe later

  constructor(private loadingService: LoadingService) {}

  ngOnInit(): void {
    // Subscribe to loading state
    this.subscription = this.loadingService.isLoading$.subscribe(status => {
      this.isLoading = status;
    });
  }

  ngOnDestroy(): void {
    // Prevent memory leaks
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}

