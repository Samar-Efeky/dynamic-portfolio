import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { LoadingService } from '../../services/loading.service';
import { AdminBlogsService } from '../../services/admin-blogs.service';
import { InViewDirective } from '../../directives/in-view.directive';

@Component({
  selector: 'app-blog-details',
  imports: [InViewDirective],
  templateUrl: './blog-details.component.html',
  styleUrl: './blog-details.component.scss',
})
export class BlogDetailsComponent implements OnInit, OnDestroy{
  blogId: string | null = null;
  blog: any | null = null;
  private destroy$ = new Subject<void>();
  constructor(private route:ActivatedRoute,
    private loadingService:LoadingService,
    private blogsService:AdminBlogsService
  ){}
  ngOnInit() {
      this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const uid = params.get('uid');   
        this.blogId = params.get('id');
  
        if (uid && this.blogId) {
          this.loadProject(uid, this.blogId);
        }
      });
    }
  async loadProject(uid: string, projectId: string) {
    this.loadingService.show();
    try {
      const projectData = await this.blogsService.getBlogById(uid, projectId);
      if (!projectData) return;
      this.blog = projectData;
    } catch (err) {
      console.error('Error loading project:', err);
    } finally {
      this.loadingService.hide();
    }
  }
   ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
