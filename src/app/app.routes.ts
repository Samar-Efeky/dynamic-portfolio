import { Routes } from '@angular/router';
import { Portfolio } from './puplic portfolio/portfolio/portfolio';
import { AboutPortfolio } from './puplic portfolio/about-portfolio/about-portfolio';
import { ServicesPortfolio } from './puplic portfolio/services-portfolio/services-portfolio';
import { ContactPortfolio } from './puplic portfolio/contact-portfolio/contact-portfolio';
import { PersonalPortfolio } from './personal-portfolio/personal-portfolio';
import { Skills } from './puplic portfolio/skills/skills';
import { Experience } from './puplic portfolio/experience/experience';
import { Education } from './puplic portfolio/education/education';
import { Certification } from './puplic portfolio/certification/certification';
import { ProjectsPortfolio } from './puplic portfolio/projects-portfolio/projects-portfolio';
import { BlogsPortfolio } from './puplic portfolio/blogs-portfolio/blogs-portfolio';
import { AdminPortfolio } from './admin-portfolio/admin-portfolio';
import { AdminInfo } from './admin-components/admin-info/admin-info';
import { AdminAbout } from './admin-components/admin-about/admin-about';
import { AdminExperience } from './admin-components/admin-experience/admin-experience';
import { AdminProjects } from './admin-components/admin-projects/admin-projects';
import { AdminServices } from './admin-components/admin-services/admin-services';
import { AdminBlogs } from './admin-components/admin-blogs/admin-blogs';
import { AdminTestimonials } from './admin-components/admin-testimonials/admin-testimonials';
import { SignIn } from './admin-components/sign-in/sign-in';
import { SignUp } from './admin-components/sign-up/sign-up';
import { AuthGuard } from './guards/auth.guard';
import { ProjectDetails } from './puplic portfolio/project-details/project-details';
import { NotfoundPageComponent } from './puplic portfolio/notfound-page/notfound-page.component';
export const routes: Routes = [
  {
    path: 'admin',
    component: AdminPortfolio,
     canActivate: [AuthGuard],
    children: [
      { path: '', component: AdminInfo },
      { path: 'about', component: AdminAbout },
      { path: 'experience', component: AdminExperience },
      { path: 'projects', component: AdminProjects },
      { path: 'services', component: AdminServices },
      { path: 'blogs', component: AdminBlogs },
      { path: 'testimonials', component: AdminTestimonials },
      {path:'**', component:NotfoundPageComponent}
    ]
  },
  {
    path:'sign-in',canActivate: [AuthGuard], component:SignIn 
  },
  {
    path:'sign-up',  canActivate: [AuthGuard], component:SignUp
  },
  {
    path: 'portfolio/:username',
    component: PersonalPortfolio,
    children: [
      { path: '', component: Portfolio,
        children: [
          { path: '', component: Skills },
          { path: 'experience', component: Experience },
          { path: 'education', component: Education },
          { path: 'certification', component: Certification }
        ]
      },
      { path: 'about', component: AboutPortfolio },
      { path: 'services', component: ServicesPortfolio },
      { path: 'projects', component: ProjectsPortfolio },
      { path: 'blogs', component: BlogsPortfolio },
      { path: 'contact', component: ContactPortfolio },
      {path:'project-details/:id/:uid', component:ProjectDetails},
      {path:'**', component:NotfoundPageComponent}
    ]
  },
  { path: '', redirectTo: 'sign-in', pathMatch: 'full' },
  {path:'**', component:NotfoundPageComponent}
];

