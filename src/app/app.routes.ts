import { Routes } from '@angular/router';
import { AdminPortfolio } from './admin-portfolio/admin-portfolio';
import { Portfolio } from './portfolio/portfolio';
export const routes: Routes = [
    {
        path:'portfolio-dashboard',
        component:AdminPortfolio,
        children:[

        ]
    },
     {
    path: 'portfolio',
    component:Portfolio
  },{
        path:'', redirectTo:'portfolio',
        pathMatch:'full'
    }
];
