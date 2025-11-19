import { Component } from '@angular/core';
import { PersonalPortfolio } from "./personal-portfolio/personal-portfolio";
@Component({
  selector: 'app-root',
  imports: [ PersonalPortfolio],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
}
