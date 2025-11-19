import { Routes } from '@angular/router';
import { Portfolio } from './puplic portfolio/portfolio/portfolio';
import { AboutPortfolio } from './puplic portfolio/about-portfolio/about-portfolio';
import { ServicesPortfolio } from './puplic portfolio/services-portfolio/services-portfolio';
import { WorkPortfolio } from './puplic portfolio/work-portfolio/work-portfolio';
import { ContactPortfolio } from './puplic portfolio/contact-portfolio/contact-portfolio';
import { PersonalPortfolio } from './personal-portfolio/personal-portfolio';
import { Skills } from './puplic portfolio/skills/skills';
import { Experience } from './puplic portfolio/experience/experience';
import { Education } from './puplic portfolio/education/education';
import { Certification } from './puplic portfolio/certification/certification';
export const routes: Routes = [
  {
    path:'', component: PersonalPortfolio,
    children:[
        { path:'', component: Portfolio,
          children:[
            {
              path:'',component:Skills
            },
            {
              path:'experience', component:Experience
            },
            {
              path:'education', component:Education
            },
            {
              path:'certification', component:Certification
            }
          ]
         }, 
        { path:'about', component: AboutPortfolio },
        { path:'services', component: ServicesPortfolio },
        { path:'work', component: WorkPortfolio },
        { path:'contact', component: ContactPortfolio }
    ]
 }
];
