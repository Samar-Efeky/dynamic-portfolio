import { Routes } from '@angular/router';
import { AdminPortfolio } from './admin-portfolio/admin-portfolio';
import { Portfolio } from './portfolio/portfolio';
import { getPrerenderParams } from '../prerender-params';


export const routes: Routes = [
    {
        path:'portfolio-dashboard',
        component:AdminPortfolio,
        children:[

        ]
    },
     {
    path: 'portfolio/:username',
    component:Portfolio
  },{
        path:'',redirectTo:'portfolio/:username',
        pathMatch:'full'
    }
];
