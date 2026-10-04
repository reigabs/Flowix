import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/autenticacao/home-publica/home-publica')
    .then(m => m.HomePublica)
  },
];