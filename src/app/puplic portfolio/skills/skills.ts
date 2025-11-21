import { Component } from '@angular/core';
import { InViewDirective } from '../../directives/in-view.directive';

@Component({
  selector: 'app-skills',
  imports: [InViewDirective],
  templateUrl: './skills.html',
  styleUrl: './skills.scss',
})
export class Skills {
   skills = [
    { title: 'Communication' },
    { title: 'Design' },
    { title: 'Project Management'},
    { title: 'Branding' },
    { title: 'Development'},
    { title: 'Problem Solving' },
    { title: 'Content Writing' },
    { title: 'Marketing' },
  ];
}
