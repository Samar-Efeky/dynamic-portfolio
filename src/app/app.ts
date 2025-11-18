import { Component } from '@angular/core';
import { Portfolio } from "./portfolio/portfolio";


@Component({
  selector: 'app-root',
  imports: [ Portfolio],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
}
