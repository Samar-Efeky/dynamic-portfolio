import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  
  {
    path: 'portfolio/:username',
    renderMode: RenderMode.Server
  },
  {
    path: 'portfolio/:username/**',
    renderMode: RenderMode.Server
  },

  // باقي الموقع prerender
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
