import { Routes } from '@angular/router';
import { PaginaInicial } from './features/pagina-inicial/pagina-inicial';
import { Cadastro } from './features/autenticacao/cadastro/cadastro';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'pagina-inicial',
    pathMatch: 'full'
  },
  {
    path: 'pagina-inicial',
    component: PaginaInicial
  },
  {
    path: 'cadastro-perfil',
    component: Cadastro
  }
];