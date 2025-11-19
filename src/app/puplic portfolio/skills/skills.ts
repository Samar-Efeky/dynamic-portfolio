import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { InViewDirective } from '../../directives/in-view.directive';

@Component({
  selector: 'app-skills',
  imports: [CommonModule, InViewDirective],
  templateUrl: './skills.html',
  styleUrl: './skills.scss',
})
export class Skills {
   skills = [
    { title: 'Communication', percent: 85 },
    { title: 'Design', percent: 90 },
    { title: 'Project Management', percent: 87 },
    { title: 'Branding', percent: 92 },
    { title: 'Development', percent: 77 },
    { title: 'Problem Solving', percent: 75 },
    { title: 'Content Writing', percent: 80 },
    { title: 'Marketing', percent: 85 },
  ];
}
