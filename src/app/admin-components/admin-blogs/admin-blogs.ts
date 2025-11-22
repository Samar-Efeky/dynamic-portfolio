import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-admin-blogs',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-blogs.html',
  styleUrl: './admin-blogs.scss'
})
export class AdminBlogs {
   blogTitle = '';
  blogSubtitle = '';
  blogDescription = '';

  blogs: any[] = [];

  addBlog() {
    if (!this.blogTitle || !this.blogSubtitle) return;

    this.blogs.push({
      title: this.blogTitle,
      subtitle: this.blogSubtitle,
      description: this.blogDescription
    });

    this.blogTitle = '';
    this.blogSubtitle = '';
    this.blogDescription = '';
  }

  removeBlog(i: number) {
    this.blogs.splice(i, 1);
  }

  getPayload() {
    return {
      blogs: this.blogs
    };
  }
}
