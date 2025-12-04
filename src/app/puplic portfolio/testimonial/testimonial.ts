import { Component, effect, OnDestroy, ViewChild } from '@angular/core';
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';
import { InViewDirective } from "../../directives/in-view.directive";
import { UserStateService } from '../../services/user-state.service';
import { AdminTestimonialsService } from '../../services/admin-testimonials.service';

@Component({
  selector: 'app-testimonial',
  standalone: true,
  imports: [CarouselModule, InViewDirective],
  templateUrl: './testimonial.html',
  styleUrls: ['./testimonial.scss'],
})
export class Testimonial implements OnDestroy {

  @ViewChild('owlCar') owlCar: any;

  data: any = null;

  private destroyed = false;
  private dataLoaded = false;
  private currentUid: string | null = null;

  constructor(
    private userState: UserStateService,
    private _AdminTestimonials: AdminTestimonialsService
  ) {

    effect(() => {
      if (this.destroyed) return;

      const uid = this.userState.uid();
      if (!uid) return;
      if (this.dataLoaded && this.currentUid === uid) return;

      this.currentUid = uid;
      this.dataLoaded = true;
      this.loadData(uid);
    });
  }

  async loadData(uid: string) {
    const content=await this._AdminTestimonials.getTestimonials(uid);
    if(content){
        this.data = content;
    }
  }

  carouselOptions: OwlOptions = {
    loop: true,
    dots: true,
    nav: false,
    margin: 20,
    autoplay: true,
    autoplayTimeout: 4000,
    autoplayHoverPause: true,
    dotsData: true,
    responsive: {
      0: { items: 1 },
      600: { items: 2 },
      1024: { items: 3 }
    }
  };

  getDots(): string[] {
    return Array(3).fill('');
  }

  ngOnDestroy() {
    this.destroyed = true;
    try {
      if (this.owlCar && this.owlCar.autoplayInterval) {
        clearInterval(this.owlCar.autoplayInterval);
      }
    } catch {}
    this.data = null;
  }
}
