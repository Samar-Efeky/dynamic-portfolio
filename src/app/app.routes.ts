import { Routes } from '@angular/router';
import { Portfolio } from './puplic portfolio/portfolio/portfolio';
import { AboutPortfolio } from './puplic portfolio/about-portfolio/about-portfolio';
import { ServicesPortfolio } from './puplic portfolio/services-portfolio/services-portfolio';
import { WorkPortfolio } from './puplic portfolio/work-portfolio/work-portfolio';
import { ContactPortfolio } from './puplic portfolio/contact-portfolio/contact-portfolio';
import { PersonalPortfolio } from './personal-portfolio/personal-portfolio';
export const routes: Routes = [
  {
    path:'', component: PersonalPortfolio,
    children:[
        { path:'', component: Portfolio }, 
        { path:'about', component: AboutPortfolio },
        { path:'services', component: ServicesPortfolio },
        { path:'work', component: WorkPortfolio },
        { path:'contact', component: ContactPortfolio }
    ]
 }
];
